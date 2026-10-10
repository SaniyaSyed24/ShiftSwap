
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
from pathlib import Path
from datetime import datetime
import json

from rules import validate_claim

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent.parent
SEED_FILE = BASE_DIR / "data" / "ShiftSwap_seed.json"

client = MongoClient(
    "mongodb://127.0.0.1:27017",
    serverSelectionTimeoutMS=3000
)
db = client["shiftswap"]

staff_collection = db["staff"]
shifts_collection = db["shifts"]
listings_collection = db["listings"]
history_collection = db["history"]
meta_collection = db["meta"]


# -------------------- HELPERS --------------------

def clean(document):
    if not document:
        return None
    return {
        key: value
        for key, value in document.items()
        if key != "_id"
    }


def record_history(actor_id, action, shift_id, outcome, message):
    history_collection.insert_one({
        "actor_id": actor_id,
        "action": action,
        "shift_id": shift_id,
        "outcome": outcome,
        "message": message,
        "timestamp": datetime.now().isoformat(timespec="seconds")
    })


def get_person(person_id):
    return staff_collection.find_one(
        {"id": person_id}, {"_id": 0}
    )


def get_shift(shift_id):
    return shifts_collection.find_one(
        {"id": shift_id}, {"_id": 0}
    )


def get_listing(shift_id):
    return listings_collection.find_one(
        {"shift_id": shift_id},
        {"_id": 0},
        sort=[("_id", -1)]
    )


def active_listing_exists(shift_id):
    return listings_collection.find_one({
        "shift_id": shift_id,
        "status": {"$in": ["OPEN", "CLAIMED"]}
    })


def is_manager(person):
    return person and person.get("role") == "MANAGER"


def is_staff(person):
    return person and person.get("role") == "STAFF"


def assigned_shifts():
    return list(shifts_collection.find({}, {"_id": 0}))


def claim_errors(candidate, target_shift):
    staff = list(staff_collection.find({}, {"_id": 0}))
    shifts = assigned_shifts()
    return validate_claim(candidate, target_shift, staff, shifts)


def error_response(message, status=400):
    return jsonify({"success": False, "error": message}), status


# -------------------- INITIALIZATION --------------------

def initialize_data():
    if meta_collection.find_one({"_id": "initialized"}):
        return

    if not SEED_FILE.exists():
        raise FileNotFoundError(
            f"Seed file not found: {SEED_FILE}"
        )

    with open(SEED_FILE, "r", encoding="utf-8") as file:
        seed = json.load(file)

    if staff_collection.count_documents({}) == 0:
        staff_collection.insert_many(seed["staff"])

    if shifts_collection.count_documents({}) == 0:
        shifts_collection.insert_many(seed["shifts"])

    meta_collection.update_one(
        {"_id": "initialized"},
        {"$setOnInsert": {
            "created_at": datetime.now().isoformat()
        }},
        upsert=True
    )


# -------------------- BASIC ROUTES --------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "ShiftSwap API is running!"
    })


@app.route("/api/health", methods=["GET"])
def health():
    try:
        client.admin.command("ping")
        return jsonify({
            "api": "ok",
            "mongodb": "connected"
        })
    except Exception as error:
        return jsonify({
            "api": "ok",
            "mongodb": "disconnected",
            "error": str(error)
        }), 503


@app.route("/api/staff", methods=["GET"])
def get_staff():
    return jsonify(list(staff_collection.find({}, {"_id": 0})))


@app.route("/api/shifts", methods=["GET"])
def get_shifts():
    return jsonify(assigned_shifts())


# -------------------- LISTINGS --------------------


@app.route("/api/listings/<shift_id>/eligibility/<staff_id>", methods=["GET"])
def check_eligibility(shift_id, staff_id):
    candidate = get_person(staff_id)
    shift = get_shift(shift_id)

    if not candidate:
        return error_response("Staff member not found", 404)

    if not is_staff(candidate):
        return error_response("Only staff members can claim shifts", 403)

    if not shift:
        return error_response("Shift not found", 404)

    listing = get_listing(shift_id)

    if not listing or listing.get("status") != "OPEN":
        return jsonify({
            "success": True,
            "eligible": False,
            "errors": ["This shift is no longer available."]
        })

    if listing.get("posted_by") == staff_id:
        errors = ["Rule 1: You cannot claim your own shift."]
    else:
        errors = claim_errors(candidate, shift)

    return jsonify({
        "success": True,
        "eligible": len(errors) == 0,
        "errors": errors,
        "shift_id": shift_id,
        "staff_id": staff_id
    })


@app.route("/api/listings", methods=["GET"])
def get_listings():
    status = request.args.get("status")
    query = {}

    if status:
        query["status"] = status.upper()

    results = []
    for listing in listings_collection.find(query, {"_id": 0}):
        shift = get_shift(listing["shift_id"])
        poster = get_person(listing.get("posted_by"))
        claimer = get_person(listing.get("claimed_by"))

        results.append({
            **listing,
            "shift": shift,
            "poster": poster,
            "claimer": claimer
        })

    return jsonify(results)


@app.route("/api/listings", methods=["POST"])
def post_listing():
    data = request.get_json(silent=True) or {}
    shift_id = data.get("shift_id")
    staff_id = data.get("staff_id")

    if not shift_id or not staff_id:
        return error_response(
            "shift_id and staff_id are required"
        )

    person = get_person(staff_id)
    shift = get_shift(shift_id)

    if not person:
        return error_response("Staff member not found", 404)

    if not is_staff(person):
        return error_response(
            "Only staff members can post shifts", 403
        )

    if not shift:
        return error_response("Shift not found", 404)

    if shift["assigned_to"] != staff_id:
        return error_response(
            "You can only post your own assigned shifts", 403
        )

    if active_listing_exists(shift_id):
        return error_response(
            "This shift already has an active listing", 409
        )

    listing = {
        "shift_id": shift_id,
        "posted_by": staff_id,
        "claimed_by": None,
        "status": "OPEN"
    }

    try:
        listings_collection.insert_one(listing)
    except Exception:
        return error_response(
            "Could not create listing", 500
        )

    record_history(
        staff_id, "POST", shift_id, "SUCCESS",
        "Shift posted"
    )


    return jsonify({
        "success": True,
        "message": "Shift posted successfully",
        "listing": {
            "shift_id": shift_id,
            "posted_by": staff_id,
            "claimed_by": None,
            "status": "OPEN"
        }
    }), 201



# -------------------- CLAIM --------------------

@app.route("/api/listings/<shift_id>/claim", methods=["POST"])
def claim_shift(shift_id):
    data = request.get_json(silent=True) or {}
    staff_id = data.get("staff_id")

    if not staff_id:
        return error_response("staff_id is required")

    candidate = get_person(staff_id)
    shift = get_shift(shift_id)

    if not candidate:
        return error_response("Staff member not found", 404)

    if not is_staff(candidate):
        return error_response(
            "Only staff members can claim shifts", 403
        )

    if not shift:
        return error_response("Shift not found", 404)

    listing = get_listing(shift_id)

    if not listing or listing.get("status") != "OPEN":
        return error_response(
            "This shift is no longer available", 409
        )

    if staff_id == listing.get("posted_by"):
        errors = [
            "Rule 1: You cannot claim your own shift."
        ]
    else:
        errors = claim_errors(candidate, shift)

    if errors:
        record_history(
            staff_id, "CLAIM", shift_id, "REJECTED",
            "; ".join(errors)
        )
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    updated = listings_collection.find_one_and_update(
        {
            "shift_id": shift_id,
            "status": "OPEN"
        },
        {
            "$set": {
                "status": "CLAIMED",
                "claimed_by": staff_id
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        return error_response(
            "This shift is no longer available", 409
        )

    record_history(
        staff_id, "CLAIM", shift_id, "SUCCESS",
        "Shift claim submitted for manager approval"
    )

    return jsonify({
        "success": True,
        "message": "Claim submitted for manager approval",
        "listing": clean(updated)
    })


# -------------------- UNCLAIM --------------------

@app.route("/api/listings/<shift_id>/unclaim", methods=["POST"])
def unclaim_shift(shift_id):
    data = request.get_json(silent=True) or {}
    staff_id = data.get("staff_id")

    if not staff_id:
        return error_response("staff_id is required")

    person = get_person(staff_id)
    listing = get_listing(shift_id)

    if not is_staff(person):
        return error_response(
            "Only staff members can unclaim shifts", 403
        )

    if not listing or listing.get("status") != "CLAIMED":
        return error_response(
            "There is no pending claim for this shift", 409
        )

    if listing.get("claimed_by") != staff_id:
        return error_response(
            "You can only unclaim your own claim", 403
        )

    updated = listings_collection.find_one_and_update(
        {
            "shift_id": shift_id,
            "status": "CLAIMED",
            "claimed_by": staff_id
        },
        {
            "$set": {
                "status": "OPEN",
                "claimed_by": None
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        return error_response(
            "Listing changed; refresh and try again", 409
        )

    record_history(
        staff_id, "UNCLAIM", shift_id, "SUCCESS",
        "Claim withdrawn; listing reopened"
    )

    return jsonify({
        "success": True,
        "message": "Claim withdrawn",
        "listing": clean(updated)
    })


# -------------------- WITHDRAW LISTING --------------------

@app.route("/api/listings/<shift_id>/withdraw", methods=["POST"])
def withdraw_listing(shift_id):
    data = request.get_json(silent=True) or {}
    staff_id = data.get("staff_id")

    if not staff_id:
        return error_response("staff_id is required")

    person = get_person(staff_id)
    listing = get_listing(shift_id)

    if not is_staff(person):
        return error_response(
            "Only staff members can withdraw listings", 403
        )

    if not listing or listing.get("status") != "OPEN":
        return error_response(
            "Only open listings can be withdrawn", 409
        )

    if listing.get("posted_by") != staff_id:
        return error_response(
            "Only the person who posted this listing can withdraw it",
            403
        )

    updated = listings_collection.find_one_and_update(
        {
            "shift_id": shift_id,
            "status": "OPEN",
            "posted_by": staff_id
        },
        {"$set": {"status": "WITHDRAWN"}},
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        return error_response(
            "Listing changed; refresh and try again", 409
        )

    record_history(
        staff_id, "WITHDRAW", shift_id, "SUCCESS",
        "Listing withdrawn"
    )

    return jsonify({
        "success": True,
        "message": "Listing withdrawn",
        "listing": clean(updated)
    })


# -------------------- MANAGER APPROVE / REJECT --------------------

@app.route("/api/listings/<shift_id>/approve", methods=["POST"])
def approve_claim(shift_id):
    data = request.get_json(silent=True) or {}
    manager_id = data.get("manager_id")

    if not manager_id:
        return error_response("manager_id is required")

    manager = get_person(manager_id)
    listing = get_listing(shift_id)
    shift = get_shift(shift_id)

    if not is_manager(manager):
        return error_response(
            "Only managers can approve claims", 403
        )

    if not listing or listing.get("status") != "CLAIMED":
        return error_response(
            "There is no pending claim to approve", 409
        )

    if not shift:
        return error_response("Shift not found", 404)

    candidate_id = listing.get("claimed_by")
    candidate = get_person(candidate_id)

    if not candidate or not is_staff(candidate):
        return error_response(
            "Claiming staff member not found", 404
        )

    # Recheck rules against the current assignments.
    errors = claim_errors(candidate, shift)

    if errors:
        record_history(
            manager_id, "APPROVE", shift_id, "REJECTED",
            "Approval blocked: " + "; ".join(errors)
        )
        return jsonify({
            "success": False,
            "message": "Claim no longer satisfies the rules",
            "errors": errors,
            "listing_remains": "CLAIMED"
        }), 400

    old_owner = shift["assigned_to"]

    # Atomically change the listing status first.
    updated_listing = listings_collection.find_one_and_update(
        {
            "shift_id": shift_id,
            "status": "CLAIMED",
            "claimed_by": candidate_id
        },
        {
            "$set": {
                "status": "APPROVED",
                "approved_by": manager_id
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated_listing:
        return error_response(
            "Listing changed; refresh and try again", 409
        )

    result = shifts_collection.update_one(
        {
            "id": shift_id,
            "assigned_to": old_owner
        },
        {"$set": {"assigned_to": candidate_id}}
    )

    if result.modified_count != 1:
        # Restore the listing if the assignment could not be updated.
        listings_collection.update_one(
            {
                "shift_id": shift_id,
                "status": "APPROVED",
                "approved_by": manager_id
            },
            {
                "$set": {"status": "CLAIMED"},
                "$unset": {"approved_by": ""}
            }
        )
        return error_response(
            "Assignment changed unexpectedly; retry", 409
        )

    record_history(
        manager_id, "APPROVE", shift_id, "SUCCESS",
        f"Shift reassigned from {old_owner} to {candidate_id}"
    )

    return jsonify({
        "success": True,
        "message": "Claim approved and shift reassigned",
        "shift": get_shift(shift_id),
        "listing": clean(updated_listing)
    })


@app.route("/api/listings/<shift_id>/reject", methods=["POST"])
def reject_claim(shift_id):
    data = request.get_json(silent=True) or {}
    manager_id = data.get("manager_id")

    if not manager_id:
        return error_response("manager_id is required")

    manager = get_person(manager_id)
    listing = get_listing(shift_id)

    if not is_manager(manager):
        return error_response(
            "Only managers can reject claims", 403
        )

    if not listing or listing.get("status") != "CLAIMED":
        return error_response(
            "There is no pending claim to reject", 409
        )

    updated = listings_collection.find_one_and_update(
        {
            "shift_id": shift_id,
            "status": "CLAIMED"
        },
        {
            "$set": {
                "status": "OPEN",
                "claimed_by": None,
                "last_rejected_by": manager_id
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        return error_response(
            "Listing changed; refresh and try again", 409
        )

    record_history(
        manager_id, "REJECT", shift_id, "SUCCESS",
        "Claim rejected; listing reopened"
    )

    return jsonify({
        "success": True,
        "message": "Claim rejected; listing is open again",
        "listing": clean(updated)
    })


# -------------------- ACTION HISTORY --------------------

@app.route("/api/history", methods=["GET"])
def get_history():
    actor_id = request.args.get("actor_id")
    query = {}

    if actor_id:
        query["actor_id"] = actor_id

    history = list(
        history_collection.find(query, {"_id": 0})
        .sort("timestamp", -1)
    )

    return jsonify(history)


# -------------------- START SERVER --------------------

if __name__ == "__main__":
    initialize_data()
    app.run(debug=True, port=5000)

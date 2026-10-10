
from datetime import datetime, timedelta


def parse_time(value):
    return datetime.strptime(value, "%Y-%m-%dT%H:%M")


def overlaps(start_a, end_a, start_b, end_b):
    return start_a < end_b and start_b < end_a


def week_start(value):
    date = parse_time(value).date()
    monday = date - timedelta(days=date.weekday())
    return datetime.combine(monday, datetime.min.time())


def validate_claim(candidate, shift, staff, shifts):
    """
    Validate whether candidate can claim shift.
    Returns a list of all rule violations.
    """
    errors = []

    # Rule 1: Staff cannot claim their own shift.
    if candidate["id"] == shift["assigned_to"]:
        return ["Rule 1: You cannot claim your own shift."]

    # Rule 2: Required certification.
    required = shift.get("required_certification")
    if required and required not in candidate.get("certifications", []):
        errors.append(
            f"Rule 2: Missing required certification: {required}."
        )

    target_start = parse_time(shift["start"])
    target_end = parse_time(shift["end"])

    # Only shifts currently assigned to the candidate count.
    assigned = [
        item for item in shifts
        if item["assigned_to"] == candidate["id"]
        and item["id"] != shift["id"]
    ]

    # Rule 3: No overlapping shifts.
    for item in assigned:
        existing_start = parse_time(item["start"])
        existing_end = parse_time(item["end"])

        if overlaps(
            target_start, target_end,
            existing_start, existing_end
        ):
            errors.append(
                f"Rule 3: Overlaps with shift {item['id']}."
            )

    # Rule 4: At least 11 hours between non-overlapping shifts.
    for item in assigned:
        existing_start = parse_time(item["start"])
        existing_end = parse_time(item["end"])

        if overlaps(
            target_start, target_end,
            existing_start, existing_end
        ):
            continue

        if existing_end <= target_start:
            rest = target_start - existing_end
        elif target_end <= existing_start:
            rest = existing_start - target_end
        else:
            continue

        if rest < timedelta(hours=11):
            errors.append(
                f"Rule 4: Less than 11 hours' rest between "
                f"shift {item['id']} and {shift['id']}."
            )

    # Rule 5: Maximum 40 hours in the target shift's start week.
    start_of_week = week_start(shift["start"])
    end_of_week = start_of_week + timedelta(days=7)

    weekly_minutes = 0

    for item in assigned:
        item_start = parse_time(item["start"])
        if start_of_week <= item_start < end_of_week:
            weekly_minutes += int(
                (parse_time(item["end"]) - item_start).total_seconds()
                // 60
            )

    weekly_minutes += int(
        (target_end - target_start).total_seconds() // 60
    )

    if weekly_minutes > 40 * 60:
        errors.append(
            f"Rule 5: Weekly hours would be "
            f"{weekly_minutes / 60:g}, exceeding 40 hours."
        )

    return errors

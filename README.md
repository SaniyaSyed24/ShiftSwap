ShiftSwap – Clinic Staff Shift Exchange

About the Project

ShiftSwap is a web application designed to make shift exchanges easier for clinic staff. Staff members can post shifts they want to exchange, claim shifts posted by others, and wait for manager approval.

The application checks whether a staff member is eligible to take a shift before allowing the exchange. It considers certifications, overlapping shifts, required rest time, and weekly working hours.

What Can You Do With ShiftSwap?

- View staff members and their assigned shifts.
- Post a shift for exchange or withdraw a listing.
- Claim an available shift or cancel a pending claim.
- Check why a shift can or cannot be claimed.
- Approve or reject shift claims as a manager.
- View the history of actions performed in the application.
- Keep shift and listing data saved in MongoDB, even after restarting the backend.

Technologies Used

- Frontend: React.js and Vite
- Backend: Python and Flask
- Database: MongoDB
- Other tools: Flask-CORS and PyMongo


Project Structure

frontend/ contains the React application.
backend/ contains the Flask API and shift validation logic.
data/ contains the initial staff and shift data.
README.md contains project information and setup instructions.
AI_USAGE.md explains how AI tools were used during development.

How to Run the Project

Requirements

Make sure Python, Node.js, npm, and MongoDB are installed on your system.

1. Start MongoDB

Make sure your local MongoDB service is running.

The application connects to mongodb://127.0.0.1:27017 and uses a database named shiftswap.

2. Run the backend

Open a terminal in the project folder and run:

cmd
cd backend
venv\Scripts\activate
python app.py

The backend should run at http://127.0.0.1:5000.

3. Run the frontend

Open another terminal in the project folder and run:

cmd
cd frontend
npm install
npm run dev

Open the local URL displayed in the terminal to use the application.

Shift Validation Rules

ShiftSwap follows five main rules when a staff member claims a shift:

1. Staff members cannot claim their own shifts.
2. They must have the required certification, if applicable.
3. Their assigned shifts must not overlap.
4. There must be at least 11 hours of rest between non-overlapping shifts.
5. Their total working hours for the week must not exceed 40 hours.

Managers can approve or reject pending claims. Eligibility is checked again before approval, and the existing assignment stays unchanged until the claim is approved.

Testing

During development, I tested the main workflows, including posting shifts, claiming and cancelling claims, withdrawing listings, manager approvals and rejections, activity history, and data persistence after restarting the backend.


# Online Course Management Platform (MOOC)

A comprehensive web-based information system designed to manage online education. This platform connects Students, Instructors, Administrators, and Data Analysts through a unified interface for learning, teaching, and platform management.

## 👥 Team: Query Ninjas

* **B. Siddaarth** (23CS30011)
* **Yellapu Dheeraj Babu** (23CS10081)
* **Maddipatla Sai Sravan** (23CS10041)
* **Garlapati Srimannadh Reddy** (23CS10020)

---

## 🚀 Project Overview

This project implements a decoupled full-stack architecture to create a dynamic role-adaptive online learning environment.

### Key Features by Role

**👨‍🎓 Student**
* **Course Catalog:** Browse available courses with details on duration, skill level, and fees.
* **Enrollment:** One-click enrollment into courses.
* **Learning Dashboard:** Access course content organized in folders (Videos, Notes, Textbooks).
* **Performance:** Submit assignments and view grades/evaluations.

**👨‍🏫 Instructor**
* **Curriculum Management:** Create courses and organize content (Videos, Notes) into hierarchical folders.
* **Student Oversight:** View enrolled students and manage grades/evaluations.
* **Financial Tracking:** Monitor earnings based on course enrollments.

**🕵️ Data Analyst**
* **Analytics Dashboard:** View high-level metrics like Total Revenue, Total Enrollments, and Average Revenue per Course.
* **Visual Reports:** Analyze revenue by course, enrollments by country, and grade distributions via charts.

**🛠 System Administrator**
* **User Management:** Oversee Students, Instructors, and Analysts.
* **University Registry:** Manage partner institutions and course oversight.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Visualizations:** Recharts / Standard charting libraries

### Backend
* **Framework:** FastAPI (Python)
* **Database ORM:** SQLAlchemy
* **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing
* **Database:** PostgreSQL

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js & npm
* PostgreSQL installed and running

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment and activate it:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Environment Configuration**: Create a `.env` file in the `backend/` directory with the following keys:
    ```env
    SECRET_KEY=your_super_secret_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    SQLALCHEMY_DATABASE_URI=postgresql://user:password@localhost/dbname
    
    # Role Verification Keys (for signup)
    INSTRUCTOR_KEY=secret_instructor_key
    ANALYST_KEY=secret_analyst_key
    ADMIN_KEY=secret_admin_key
    ```

5.  Run the server:
    ```bash
    uvicorn backend.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## 🔐 Authentication

The system uses Role-Based Access Control (RBAC). During signup, specialized roles (Instructor, Analyst, Admin) require a specific **Enrollment Key** (configured in your `.env` file) to verify authorization.

## 📂 Project Structure

```text
MOOC/
├── backend/
│   ├── main.py             # API Entry point and Route definitions
│   ├── database.py         # Database connection logic
│   ├── models.py           # SQLAlchemy Database Models
│   ├── schemas.py          # Pydantic Models for validation
│   ├── crud.py             # Database CRUD operations
│   ├── security.py         # Authentication dependencies
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── pages/          # Page views for different roles
│   │   └── context/        # React Context API files
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # Project documentation

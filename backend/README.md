# 🧠 MOOC Backend Architecture

This documentation outlines the technical design, data structures, and logic flow of the MOOC Platform backend.

## 🛠 Tech Stack

- **Framework:** FastAPI (Asynchronous Python)
- **Database:** PostgreSQL (Hosted on Neon.tech)
- **ORM:** SQLAlchemy (2.0 Style)
- **Validation:** Pydantic V2
- **Security:** JWT (JSON Web Tokens) & Passlib (Bcrypt)
- **Server:** Uvicorn

---

## 🔐 Security & Access Control

The backend implements **Role-Based Access Control (RBAC)** using FastAPI dependencies.

### Authentication Flow:
- Passwords are hashed using **Bcrypt** before storage.
- Successful login issues a **JWT Access Token**.
- All protected routes verify the token and the user's role before executing logic.

---

## 🔄 Data Flow & Serialization

### Deep Serialization
We leverage Pydantic V2’s `model_validate` and `from_attributes` to convert complex SQLAlchemy objects into JSON. 
- **Recursive Schemas:** The `FolderSchema` includes a self-referencing list: `subfolders: List['FolderSchema']`. This allows the frontend to fetch an entire course tree in a single API call.

### Performance Optimization
- **Database Pooling:** Configured with `pool_pre_ping=True` to handle the serverless nature of Neon DB (auto-waking the DB if it goes to sleep).
- **Lazy Loading:** Sub-content is fetched only when the specific course node is accessed to reduce initial payload size.

---

## 📡 API Service Logic

- **Content Delivery:** The API serves signed URLs or direct links for videos and documents, ensuring the database only handles metadata while external storage (or links) handles the heavy lifting.
- **Transaction Safety:** Uses SQLAlchemy `Session` management to ensure database operations are atomic; if one part of a folder creation fails, the whole transaction rolls back to prevent "ghost" data.

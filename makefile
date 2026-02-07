# Not working on Windows
# Just for idea
# ================= CONFIG =================
BACKEND=backend
FRONTEND=frontend
VENV=$(BACKEND)\venv

# ================= SETUP =================
setup-backend:
	cd $(BACKEND) && python -m venv venv
	cd $(BACKEND) && $(VENV)\Scripts\pip install -r requirements.txt

setup-frontend:
	cd $(FRONTEND) && npm install
	cd $(FRONTEND) && npm install react-router-dom react-youtube uniqid quill humanize-duration rc-progress react-simple-star-rating axios

setup:
	make setup-backend
	make setup-frontend

# ================= RUN DEV =================
run-backend:
	cd $(BACKEND) && $(VENV)\Scripts\uvicorn app.main:app --reload

run-frontend:
	cd $(FRONTEND) && npm run dev

run:
	start cmd /k "make run-backend"
	start cmd /k "make run-frontend"

# ================= CLEAN =================
clean:
	rmdir /s /q $(BACKEND)\venv
	rmdir /s /q $(FRONTEND)\node_modules

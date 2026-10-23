# CampusSwap — Connected Frontend + Backend

This package connects the existing CampusSwap HTML/CSS/JavaScript frontend to the Spring Boot REST API.

## Requirements
- Java 17
- Maven (or use the included Maven wrapper if added later)
- VS Code
- Live Server extension for the frontend

## Run the backend
Open a terminal in `backend/`:

```bash
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

The backend uses a local H2 file database under `backend/data/`, so no separate database installation is required.

## Run the frontend
Open the root `CampusSwap` folder in VS Code. Right-click `index.html` and choose **Open with Live Server**.

The frontend calls the backend at `http://localhost:8080/api`.

## Demo account
- Email: `student@campus.edu`
- Password: `Password123!`

## Important
Start the backend before logging in. Do not open `index.html` directly with a `file://` URL; use Live Server (or another local HTTP server).

## Connected features
- Login and signup use the Spring Boot API
- JWT session is stored locally only as a token/profile
- Dashboard listings come from the backend database
- New listings are saved through the API
- Item requests are saved through the API
- Accept/reject request actions use the API
- Notifications use the backend notification API

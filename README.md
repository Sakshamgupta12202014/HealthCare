# 🏥 Healthcare Backend API (with SSR using EJS)

This project is a **Healthcare Management System Backend** built with **Node.js, Express.js, PostgreSQL (Neon.tech)** and **EJS** for server-side rendering.  
It provides role-based access for **Admin**, **Doctor**, and **Patient**, ensuring secure and efficient handling of healthcare data.

---

## ✨ Features

- **Authentication & Role-based Access**
  - Login as **Admin**, **Doctor**, or **Patient**.
- **Admin Capabilities**
  - Add new patients and doctors.
  - Remove patients or doctors.
  - Access restricted APIs only available to admins.
- **Doctor & Patient Capabilities**
  - View their own details.
  - Update their own profile.
  - Delete their own account.
- **Secure Access Control**
  - Only authorized roles can perform certain actions.
- **Server-Side Rendering**
  - Uses **EJS templates** for rendering dynamic content.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon.tech cloud)
- **Templating Engine:** EJS
- **Authentication & Authorization:** Role-based middleware
- **Other:** RESTful API design, Postman testing

---

## 📂 Project Structure

```
healthcare-backend/
│── src/
│   ├── controllers/    # Business logic
|   │── db/
│   ├── models/         # Database queries
│   ├── routes/         # API routes
│   ├── middlewares/    # Role-based access, auth checks
│   ├── views/          # EJS templates
│   └── app.js          # app
|   └── index.js        # Main app entry
│
├── package.json
├── README.md
└── .env.example
```

---

## ⚡ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sakshamgupta12202014/HealthCare.git
   cd healthcare-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root folder and configure:

   ```
   PORT=8000
   PGHOST=your_neon_host
   PGDATABASE=your_database_name
   PGUSER=your_username
   PGPASSWORD=your_password
   PGPORT=5432
   SESSION_SECRET=your_secret
   ```

4. **Database setup**

   - Ensure your PostgreSQL (Neon.tech) database is running.
   - Import/create necessary tables using SQL queries.

5. **Start the server**
   ```bash
   npm start
   ```
   By default, the app should run on:
   ```
   http://localhost:8000
   ```

---

## 🚀 Usage

- Use **Postman** (or any API client) to test APIs.
- **Admin-only routes** are protected and require an **Admin role token**.
- Patients and Doctors can only **access/update/delete their own details**.

## 📌 Future Improvements

- Deployment to cloud (Render/Heroku).
- Add appointment booking system.
- API documentation with Swagger/Postman collection.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -m 'Add xyz'`)
4. Push branch (`git push origin feature/xyz`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.


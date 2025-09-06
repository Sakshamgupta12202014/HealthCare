import { getUser, setUser } from "../middlewares/auth.middleware.js";
import pool from "../db/index.js";
import bcrypt from "bcrypt";

export async function adminRegisterPatient(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }
        // console.log("Request Body:", req.body);

        const { name, email, password, age, gender, medical_history } =
            req.body;

        if (
            [name, email, password, age, gender, medical_history].some(
                (item) => item?.trim() === ""
            )
        ) {
            return res.status(401).json({
                message: "All fields are required",
            });
        }

        // search user already exists
        const existedUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existedUser?.rows.length > 0) {
            // user already exists
            return res
                .status(400)
                .json({ message: "Patient already exists with email" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // store user in table
        const user = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, "patient"]
        );

        if (!(user?.rows.length > 0)) {
            return res.status(500).json({
                message: "Something went wrong while registering user",
            });
        }

        const patient = await pool.query(
            "INSERT INTO patients (user_id, age, gender, medical_history) VALUES ($1, $2, $3, $4) RETURNING *",
            [user?.rows[0].id, age, gender, medical_history]
        );

        if (!(patient?.rows.length > 0)) {
            return res.status(500).json({
                message: "Something went wrong while registering patient",
            });
        }

        return res.status(200).json({
            patient: patient?.rows[0],
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function handleAddPatient(req, res) {
    // only admin can add patient
    const loggedInUser = req.user;

    if (loggedInUser.role.trim() !== "admin") {
        return res.status(400).json({
            message: "Only admins can perform this action",
        });
    }

    res.status(200).render("adminRegisterPatient");
}

export async function handleDeletePatientById(req, res) {}

export async function handleGetAllPatients(req, res) {}

export async function handleGetPatientById(req, res) {}

export async function handleUpdatePatientById(req, res) {}

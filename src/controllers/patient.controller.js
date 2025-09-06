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

export async function handleGetPatientById(req, res) {
    try {
        const user = req?.user;

        if (user.role !== "admin" && user.role !== "patient") {
            return res.status(403).json({
                message:
                    "Only admin or the patient himself can delete patient records",
            });
        }

        const patientId = req?.params?.patientId;

        // check in db
        const patient = await pool.query(
            "SELECT * FROM patients WHERE id = $1",
            [patientId]
        );

        if (!(patient?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find patient with patient id: ${patientId}`,
            });
        }

        // grab all details
        const allDetails = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [patient.rows[0].user_id]
        );

        if (!(allDetails?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find user with user_id: ${patient.rows[0].user_id}`,
            });
        }

        return res.status(200).json({
            patient: { ...patient.rows[0], ...allDetails.rows[0] },
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function handleUpdatePatientById(req, res) {
    try {
        const user = req?.user;
        if (user.role !== "admin" && user.role !== "patient") {
            return res.status(403).json({
                message:
                    "Only admin or the patient himself can delete patient records",
            });
        }

        const patientId = req?.params?.patientId;
        const { name, age, gender } = req?.body;

        // check in db
        const patient = await pool.query(
            "SELECT * FROM patients WHERE id = $1",
            [patientId]
        );

        if (!(patient?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find patient with patient id: ${patientId}`,
            });
        }

        const updatedPatient = await pool.query(
            "UPDATE patients SET age = $1, gender = $2 WHERE id = $3 RETURNING *",
            [age, gender, patientId]
        );

        if (!(updatedPatient?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while updating the patient id: ${patientId}`,
            });
        }

        const updatedUser = await pool.query(
            "UPDATE users SET name = $1 WHERE id = $3 RETURNING *",
            [name, patient.rows[0].user_id]
        );

        return res.status(200).json({
            patient: [
                { message: "Patient details updated successfully" },
                { ...updatedPatient.rows[0] },
                { ...updatedUser.rows[0] },
            ],
        });
    } catch (error) {
        console.error("Error in Updating user:", error);
        res.status(500).json({ message: "Error in Updating user:" });
    }
}

export async function handleDeletePatientById(req, res) {
    try {
        const user = req?.user;

        if (user.role !== "admin" && user.role !== "patient") {
            return res.status(403).json({
                message:
                    "Only admin or the patient himself can delete patient records",
            });
        }

        const patientId = req?.params?.patientId;

        // check in db
        const patient = await pool.query(
            "SELECT * FROM patients WHERE id = $1",
            [patientId]
        );

        if (!(patient?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find patient with patient id: ${patientId}`,
            });
        }

        const deletedPatient = await pool.query(
            "DELETE FROM patients WHERE id = $1 RETURNING *",
            [patientId]
        );

        if (!(deletedPatient?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while deleting the patient id: ${patientId}`,
            });
        }

        const deletedUser = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [patient.rows[0].user_id]
        );

        if (!(deletedUser?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while deleting the user id: ${patient.rows[0].user_id}`,
            });
        }

        return res.status(200).json({
            patient: [
                { message: "Patient removed successfully" },
                { ...deletedPatient.rows[0] },
                { ...deletedUser.rows[0] },
            ],
        });
    } catch (error) {
        console.error("Error in handleDeletePatientById:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function handleGetAllPatients(req, res) {
    try {
        const user = req?.user;

        // only admin can fetch all patients
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Only admin can view all patients",
            });
        }

        // get all patients
        const patients = await pool.query("SELECT * FROM patients");

        return res.status(200).json({
            message: "Patients fetched successfully",
            patients: patients.rows,
        });
    } catch (error) {
        console.error("Error in handleGetAllPatients:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

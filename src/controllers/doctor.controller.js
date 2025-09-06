import { getUser, setUser } from "../middlewares/auth.middleware.js";
import pool from "../db/index.js";
import bcrypt from "bcrypt";

export async function adminRegisterDoctor(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }
        // console.log("Request Body:", req.body);

        const { name, email, password, specialization, experience_years } =
            req.body;

        if (
            [name, email, password, specialization, experience_years].some(
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
                .json({ message: "Doctor already exists with email" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // store user in table
        const user = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, "doctor"]
        );

        if (!(user?.rows.length > 0)) {
            return res.status(500).json({
                message: "Something went wrong while registering user",
            });
        }

        const doctor = await pool.query(
            "INSERT INTO doctors (user_id, specialization, experience_years) VALUES ($1, $2, $3) RETURNING *",
            [user?.rows[0].id, specialization, experience_years]
        );

        if (!(doctor?.rows.length > 0)) {
            return res.status(500).json({
                message: "Something went wrong while registering doctor",
            });
        }

        return res.status(200).json({
            doctor: doctor?.rows[0],
        });
    } catch (error) {
        console.error("Error in registerDoctor:", error);
        res.status(500).json({
            message: error.message || "Internal Server Error",
        });
    }
}

export async function handleAddDoctor(req, res) {
    // only admin can add doctor
    const loggedInUser = req.user;

    if (loggedInUser.role.trim() !== "admin") {
        return res.status(400).json({
            message: "Only admins can perform this action",
        });
    }

    res.status(200).render("adminRegisterDoctor");
}

export async function handleGetDoctorById(req, res) {
    try {
        const user = req?.user;

        if (user.role !== "admin" && user.role !== "doctor") {
            return res.status(403).json({
                message:
                    "Only admin or the doctor himself can delete doctor records",
            });
        }

        const doctorId = req?.params?.doctorId;

        // check in db
        const doctor = await pool.query("SELECT * FROM doctors WHERE id = $1", [
            doctorId,
        ]);

        if (!(doctor?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find doctor with doctor id: ${doctorId}`,
            });
        }

        // grab all details
        const allDetails = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [doctor.rows[0].user_id]
        );

        if (!(allDetails?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find user with user_id: ${doctor.rows[0].user_id}`,
            });
        }

        return res.status(200).json({
            doctor: [{ ...doctor.rows[0] }, { ...allDetails.rows[0] }],
        });
    } catch (error) {
        console.error("Error in handleGetDoctorById:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function handleUpdateDoctorById(req, res) {
    try {
        const user = req?.user;
        if (user.role !== "admin" && user.role !== "doctor") {
            return res.status(403).json({
                message:
                    "Only admin or the doctor himself can delete doctor records",
            });
        }

        const doctorId = req?.params?.doctorId;
        const { name, specialization, experience_years } = req?.body;

        // check in db
        const doctor = await pool.query("SELECT * FROM doctors WHERE id = $1", [
            doctorId,
        ]);

        if (!(doctor?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find doctor with doctor id: ${doctorId}`,
            });
        }

        const updatedDoctor = await pool.query(
            "UPDATE doctors SET specialization = $1, experience_years = $2 WHERE id = $3 RETURNING *",
            [specialization, experience_years, doctorId]
        );

        if (!(updatedDoctor?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while updating the doctor id: ${doctorId}`,
            });
        }

        const updatedUser = await pool.query(
            "UPDATE users SET name = $1 WHERE id = $3 RETURNING *",
            [name, doctor.rows[0].user_id]
        );

        return res.status(200).json({
            doctor: [
                { message: "Doctor details updated successfully" },
                { ...updatedDoctor.rows[0] },
                { ...updatedUser.rows[0] },
            ],
        });
    } catch (error) {
        console.error("Error in Updating user:", error);
        res.status(500).json({ message: "Error in Updating user:" });
    }
}

export async function handleDeleteDoctorById(req, res) {
    try {
        const user = req?.user;

        if (user.role !== "admin" && user.role !== "doctor") {
            return res.status(403).json({
                message:
                    "Only admin or the doctor himself can delete doctor records",
            });
        }

        const doctorId = req?.params?.doctorId;

        // check in db
        const doctor = await pool.query("SELECT * FROM doctors WHERE id = $1", [
            doctorId,
        ]);

        if (!(doctor?.rows?.length > 0)) {
            return res.status(400).json({
                message: `Cannot find doctor with doctor id: ${doctorId}`,
            });
        }

        const deletedDoctor = await pool.query(
            "DELETE FROM doctors WHERE id = $1 RETURNING *",
            [doctorId]
        );

        if (!(deletedDoctor?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while deleting the doctor id: ${doctorId}`,
            });
        }

        const deletedUser = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [doctor.rows[0].user_id]
        );

        if (!(deletedUser?.rows?.length > 0)) {
            return res.status(500).json({
                message: `Something went wrong while deleting the user id: ${doctor.rows[0].user_id}`,
            });
        }

        return res.status(200).json({
            doctor: [
                { message: "Doctor removed successfully" },
                { ...deletedDoctor.rows[0] },
                { ...deletedUser.rows[0] },
            ],
        });
    } catch (error) {
        console.error("Error in handleDeleteDoctorById:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function handleGetAllDoctors(req, res) {
    try {
        const user = req?.user;

        // only admin can fetch all patients
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Only admin can view all doctors",
            });
        }

        // get all doctors
        const doctors = await pool.query("SELECT * FROM doctors");

        return res.status(200).json({
            message: "Doctors fetched successfully",
            doctors: doctors.rows,
        });
    } catch (error) {
        console.error("Error in handleGetAllDoctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

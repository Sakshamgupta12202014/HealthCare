import { getUser, setUser } from "../middlewares/auth.middleware.js";
import pool from "../db/index.js";

export async function handleAssignDoctorToPatient(req, res) {
    try {
        const { doctorId, patientId } = req.body;
        if (!doctorId || !patientId) {
            return res
                .status(400)
                .json({ message: "doctorId and patientId are required" });
        }

        // check if doctor exists
        const doctor = await pool.query("SELECT * FROM doctors WHERE id = $1", [
            doctorId,
        ]);
        if (!(doctor?.rows.length > 0)) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // check if patient exists
        const patient = await pool.query(
            "SELECT * FROM patients WHERE id = $1",
            [patientId]
        );
        if (!(patient?.rows.length > 0)) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // assign doctor to patient
        const assigned = await pool.query(
            "INSERT INTO mappings (patient_id, doctor_id) VALUES ($1, $2) RETURNING *",
            [patientId, doctorId]
        );
        return res.status(201).json({
            message: "Doctor assigned to patient successfully",
            assigned: assigned?.rows[0],
        });
    } catch (error) {
        console.error("Error assigning doctor to patient:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleRetriveAllMappings(req, res) {
    try {
        const user = req?.user;
        if (!user || user?.role !== "admin") {
            return res.status(403).json({ message: "Forbidden. Admins only" });
        }

        // assign doctor to patient
        const allDocPatMappings = await pool.query("SELECT * FROM mappings");
        return res.status(200).json({
            message: "Fetched all doctor-patient mappings successfully",
            mappings: allDocPatMappings?.rows,
        });
    } catch (error) {
        console.error("Error fetching doctor-patient mappings:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleRetreiveAllDoctorsOfAPatient(req, res) {
    try {
        const { patientId } = req.params?.patientId;
        if (!patientId) {
            return res.status(400).json({ message: "patientId are required" });
        }

        // check if patient exists
        const patient = await pool.query(
            "SELECT * FROM patients WHERE id = $1",
            [patientId]
        );

        if (!(patient?.rows.length > 0)) {
            return res.status(404).json({ message: "Patient does not exist" });
        }

        const doctorsAssignedToAPatient = await pool.query(
            "SELECT * FROM mappings WHERE id = $1",
            [patientId]
        );

        if (!(doctorsAssignedToAPatient?.rows.length > 0)) {
            return res
                .status(404)
                .json({ message: "No doctor has been assigned to patient" });
        }

        return res.status(201).json({
            message: "Doctors assigned to patient are below",
            assigned: doctorsAssignedToAPatient?.rows[0].id,
        });
    } catch (error) {
        console.error("Error fetching doctors of a patient:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleRemoveDoctorFromPatientById(req, res) {}

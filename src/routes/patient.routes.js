import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, handleAddPatient);  // admin only
router.get("/", authMiddleware, handleGetAllPatients); // admin only
router.get("/:patientId", authMiddleware, handleGetPatientById); // admin and the patient himself
router.post("/:patientId", authMiddleware, handleUpdatePatientById);  // admin and the patient himself
router.delete("/:patientId", authMiddleware, handleDeletePatientById);  // admin and the patient himself

export default router;
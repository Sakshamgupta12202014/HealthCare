import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    handleAssignDoctorToPatient,
    handleRemoveDoctorFromPatientById,
    handleRetriveAllMappings,
    handleRetreiveAllDoctorsOfAPatient,
} from "../controllers/patient-doctor-mappings.controller.js";
const router = Router();

router.post("/", authMiddleware, handleAssignDoctorToPatient);
router.get("/", authMiddleware, handleRetriveAllMappings);
router.get("/:patientId", authMiddleware, handleRetreiveAllDoctorsOfAPatient);
router.delete("/:doctorId", authMiddleware, handleRemoveDoctorFromPatientById);

export default router;

import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { handleAddDoctor, handleDeleteDoctorById, handleGetAllDoctors, handleGetDoctorById, handleUpdateDoctorById, adminRegisterDoctor } from "../controllers/doctor.controller.js";

const router = Router();

router.post("/", authMiddleware, handleAddDoctor);
router.get("/", authMiddleware, handleGetAllDoctors);
router.get("/:doctorId", authMiddleware, handleGetDoctorById);
router.post("/:doctorId", authMiddleware, handleUpdateDoctorById);
router.delete("/:doctorId", authMiddleware, handleDeleteDoctorById);

router.post("/admin/register-doctor", authMiddleware, adminRegisterDoctor);

export default router;  
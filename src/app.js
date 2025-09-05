import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));  // <-- point to src/views

// View routes
app.get("/", authMiddleware,  (req, res) => res.render("home"));
app.get("/signup", (req, res) => res.render("Signup"));
app.get("/signin", (req, res) => res.render("Signin"));

// route imports
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import patientDoctorMappingsRouter from "./routes/patient-doctor-mappings.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";

app.use("/api/auth", userRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRoutes);
app.use("/api/mappings", patientDoctorMappingsRouter);
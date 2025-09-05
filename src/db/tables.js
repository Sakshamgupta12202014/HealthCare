import pool from "./index.js";
import dotenv from "dotenv";
dotenv.config();

async function createTables() {

    try {
        // Create users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'doctor', 'patient')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create patients table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        age INT,
        gender VARCHAR(10),
        medical_history TEXT
      );
    `);

        // Create doctors table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        specialization VARCHAR(100),
        experience_years INT
      );
    `);

        // Create mappings table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS mappings (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("All tables created successfully!");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        pool.end();
    }
}

createTables();

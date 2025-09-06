import { getUser, setUser } from "../middlewares/auth.middleware.js";
import pool from "../db/index.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }
        console.log("Request Body:", req.body);
        const { name, email, password, role } = req.body;

        if ([name, email, password, role].some((item) => item?.trim() === "")) {
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
                .json({ message: "User already exists with email" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // store user in table
        const user = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, role]
        );

        if (!(user.rows.length > 0)) {
            return res.status(500).json({
                message: "Something went wrong while registering user",
            });
        }

        // check if token is present
        // const token = res.cookies?.uid;
        // if(token){
        //     const loggedInUser = getUser(token);

        // }

        // user registeration successfull
        res.render("Signin", { email, role });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req?.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // find the user
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);

        if (!(user.rows.length > 0)) {
            return res.status(400).json({
                message: "User is not registered",
            });
        }

        // check password (compare)
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const logInUser = {
            id: user.rows[0].id,
            email: user.rows[0].email,
            role: user.rows[0].role,
        };

        // generate uid and set cookies
        const token = setUser(logInUser);

        const options = {
            secure: true,
            sameSite: "none",
            maxAge: 86400000,
        };
        res.status(200)
            .cookie("uid", token, options)
            .render("home", { user: logInUser });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export async function logoutUser(req, res) {
    if (!req.cookies?.uid)
        return res.status(400).json({ message: "cannot logout" });

    res.clearCookie("uid", {
        sameSite: "None",
        secure: true,
    });
    return res.status(200).render("Signin");
}

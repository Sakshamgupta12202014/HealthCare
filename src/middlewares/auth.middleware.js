import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export function setUser(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.TOKEN_SECRET,
    );
}

export function getUser(token) {
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        console.log("jwt error", error);
        // throw new ApiError(401, "Invalid Token. Please login again.");
    }
}



async function authMiddleware(req, res, next) {
    const token = req.cookies?.uid; // token is stored in cookies with key 'uid'

    // if (!token) return res.redirect("/api/login");
    if (!token)
        return res.json({
            message: "Sorry, you are not authenticated. Please login.",
        });

    const user = getUser(token); // user ---> id, email, role

    if (!user)
        return res.json({
            message: "Sorry, you are not authenticated. Please login.",
        });

    // we studied that middlewares can change the req, res objects
    req.user = user; // make the user available in request body
    next();
}

export default authMiddleware;

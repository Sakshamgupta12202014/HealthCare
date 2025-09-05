import { getUser } from "./auth.js";

async function authMiddleware(req, res, next) {
  const token = req.cookies?.uid; // token is stored in cookies with key 'uid'

  // if (!token) return res.redirect("/api/login");
  if (!token)
    return res.json({
      message: "Sorry, you are not authenticated. Please login.",
    });

  const user = getUser(token);
  // console.log("Authenticated user:", user);

  if (!user)
    return res.json({
      message: "Sorry, you are not authenticated. Please login.",
    });

  // we studied that middlewares can change the req, res objects

  req.user = user; // make the user available in request body
  next();
}

export default authMiddleware;

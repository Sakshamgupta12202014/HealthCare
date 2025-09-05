import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";

app.listen(process.env.PORT || 8000, () => {
    console.log("SERVER STARTED at PORT : ", process.env.PORT);
});

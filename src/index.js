import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/Database.js";
import router from "./routes/index.js";
dotenv.config();
const app = express();

try {
    await db.authenticate();
    console.log('Database Connected...');
} catch (error) {
    console.log(error);
}

// Menghubungkan ke Port
const PORT = process.env.PORT; // Port yang digunakan
app.use(cors({ credentials:true, origin:'http://127.0.0.1:5173' }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

// Start server
app.listen(PORT, ()=> console.log(`Server running at port ${PORT}`));
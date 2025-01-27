import express from "express";
import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import {v2 as cloudinary} from "cloudinary";
dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUNINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Set limits for JSON payloads
app.use(express.json({ limit: '50mb' })); // Increase size limit to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// middleware simple just a function run between request and response
app.use(express.json()); // parse json data in the req.body
app.use(express.urlencoded({ extended: true })); // parse form data in the req.body
app.use(cookieParser()); // parse cookies in the req.headers

//Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);


app.listen(PORT, () =>
  console.log(`server start at http://localhost:${PORT} yay!`)
);

import express from "express";
import { getAllCourses, streamCourses } from "../controllers/course.controller.js";

const router = express.Router();

router.get("/", getAllCourses);
// SSE stream for real-time course updates
router.get("/stream", streamCourses);

export default router;

import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";
import {
  createCourse,
  deleteCourse,
  updateCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/me", adminAuth, (req, res) => {
  res.json({
    message: "Admin authenticated",
    admin: req.admin,
  });
});

router.post("/courses", adminAuth, upload.single("image"), createCourse);
router.put("/courses/:id", adminAuth, upload.single("image"), updateCourse); // ✅ EDIT COURSE with image support
router.delete("/courses/:id", adminAuth, deleteCourse);


export default router;

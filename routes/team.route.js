import express from "express";
import {
  addTeamMember,
  deleteTeamMember,
  getTeamMembers,
} from "../controllers/team.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js"; 
const router = express.Router();

// Public
router.get("/", getTeamMembers);

// Admin
router.post(
  "/",
  adminAuth,
  upload.single("image"), // 👈 THIS LINE FIXES EVERYTHING
  addTeamMember
);

router.delete("/:id", adminAuth, deleteTeamMember);

export default router;

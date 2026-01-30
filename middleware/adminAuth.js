import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 Fetch admin from DB
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminAuth;

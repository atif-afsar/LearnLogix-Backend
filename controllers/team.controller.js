
// ADMIN: Add team member
import Team from "../models/Team.model.js";

// Helper function for consistent image URL handling
const getFullImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  
  // If it's a production URL but we're in development, convert to local URL
  if (process.env.NODE_ENV !== 'production' && imagePath.includes('learnlogix-backend.onrender.com')) {
    const filename = imagePath.split('/uploads/')[1];
    if (filename) {
      const protocol = req.protocol || 'https';
      const host = req.get("host") || 'learnlogix-backend.onrender.com';
      const localUrl = `${protocol}://${host}/uploads/${filename}`;
      return localUrl;
    }
  }
  
  // If already a full URL, return as-is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // For backend uploads (/uploads/*), prepend backend URL
  if (imagePath.startsWith("/uploads/")) {
    // In development, use request host or fallback to production URL
    if (process.env.NODE_ENV !== 'production') {
      const protocol = req.protocol || 'https';
      const host = req.get("host") || 'learnlogix-backend.onrender.com';
      const fullUrl = `${protocol}://${host}${imagePath}`;
      return fullUrl;
    }
    
    // In production, use BASE_URL if available, otherwise construct from request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const fullUrl = `${baseUrl}${imagePath}`;
    return fullUrl;
  }
  
  // Default: return as-is
  return imagePath;
};

// ADMIN: Add team member
export const addTeamMember = async (req, res) => {
  try {
    const { name, role } = req.body;

    // multer puts file here
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    // Store relative path, convert to full URL when serving
    const imageUrl = `/uploads/${req.file.filename}`;

    const member = new Team({
      name,
      role,
      image: imageUrl,
    });

    await member.save();

    // Convert to full URL for response
    const memberObj = member.toObject();
    memberObj.image = getFullImageUrl(memberObj.image, req);

    res.status(201).json({
      message: "Team member added",
      member: memberObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: Delete team member (hard delete)
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Team.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.json({ message: "Team member deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC: Get team members
export const getTeamMembers = async (req, res) => {
  try {
    const members = await Team.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Convert relative paths to absolute URLs using consistent helper
    const membersWithFullUrls = members.map(member => ({
      ...member.toObject(),
      image: getFullImageUrl(member.image, req),
    }));

    res.json(membersWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

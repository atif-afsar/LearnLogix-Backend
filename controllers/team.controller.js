
// ADMIN: Add team member
import Team from "../models/Team.model.js";

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

    // Use environment variable for base URL or construct from request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const member = new Team({
      name,
      role,
      image: imageUrl,
    });

    await member.save();

    res.status(201).json({
      message: "Team member added",
      member,
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

    // Convert relative paths to absolute URLs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const membersWithFullUrls = members.map(member => ({
      ...member.toObject(),
      image: member.image.startsWith('http') 
        ? member.image 
        : `${baseUrl}${member.image}`
    }));

    res.json(membersWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

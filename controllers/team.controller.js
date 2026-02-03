// ADMIN: Add team member
import Team from "../models/Team.model.js";
import { processImageUpload } from "../utils/uploadHelper.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// ADMIN: Add team member
export const addTeamMember = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    // Upload image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await processImageUpload(req.file, 'team');
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(400).json({ 
        message: uploadError.message || "Failed to upload image" 
      });
    }

    const member = new Team({
      name,
      role,
      image: imageUrl,
    });

    await member.save();

    const memberObj = member.toObject();

    res.status(201).json({
      message: "Team member added",
      member: memberObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ADMIN: Delete team member (hard delete)
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Team.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Delete image from Cloudinary if it exists
    if (member.image) {
      await deleteFromCloudinary(member.image);
    }

    // Delete team member from database
    await Team.findByIdAndDelete(id);

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

    // Cloudinary URLs are already full URLs, no conversion needed
    const membersList = members.map(member => member.toObject());

    res.json(membersList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL (Cloudinary later)
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);

import Course from "../models/Course.model.js";
import { processImageUpload } from "../utils/uploadHelper.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// Simple in-memory SSE clients list
const sseClients = [];

const broadcastCourseEvent = (event, payload) => {
  const data = JSON.stringify(payload);
  sseClients.forEach((res) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${data}\n\n`);
    } catch (err) {
      // ignore individual client errors
    }
  });
};

export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    // normalize price coming from form-data (string) to Number
    const rawPrice = req.body.price;
    const price = rawPrice !== undefined ? Number(rawPrice) : undefined;

    if (!title || !description || price === undefined || Number.isNaN(price)) {
      return res.status(400).json({ message: "All fields are required and price must be a number" });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await processImageUpload(req.file, 'courses');
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ 
          message: uploadError.message || "Failed to upload image" 
        });
      }
    }

    const course = new Course({
      title,
      description,
      price,
      image: imageUrl,
    });

    await course.save();
    const courseObj = course.toObject();

    // broadcast create
    broadcastCourseEvent("create", courseObj);

    res.status(201).json({
      message: "Course created successfully",
      course: courseObj,
    });
  } catch (error) {
    // Log full stack for debugging
    console.error("Create course error:", error && error.stack ? error.stack : error);
    // Return the actual error message to help debugging in dev
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Cloudinary URLs are already full URLs, no conversion needed
    const coursesList = courses.map((course) => course.toObject());

    res.json(coursesList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete image from Cloudinary if it exists
    if (course.image) {
      await deleteFromCloudinary(course.image);
    }

    // Delete course from database
    await Course.findByIdAndDelete(id);

    // broadcast delete event
    broadcastCourseEvent("delete", { id });

    res.json({
      message: "Course deleted permanently",
      courseId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    // Get existing course to check for old image
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prepare update data
    const updateData = { title, description, price };
    
    // If new image is uploaded, upload to Cloudinary and delete old image
    if (req.file) {
      try {
        const newImageUrl = await processImageUpload(req.file, 'courses');
        updateData.image = newImageUrl;

        // Delete old image from Cloudinary if it exists
        if (existingCourse.image) {
          await deleteFromCloudinary(existingCourse.image);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ 
          message: uploadError.message || "Failed to upload image" 
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    const courseObj = updatedCourse.toObject();

    // broadcast update
    broadcastCourseEvent("update", courseObj);

    res.json({
      message: "Course updated successfully",
      course: courseObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// SSE stream endpoint
export const streamCourses = (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  // Send a ping to establish connection
  res.write(`retry: 10000\n\n`);

  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
};



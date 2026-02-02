import Course from "../models/Course.model.js";

// Simple in-memory SSE clients list
const sseClients = [];

const getFullImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  
  // Use environment variable for base URL or construct from request
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}${imagePath}`;
};

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

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const course = new Course({
      title,
      description,
      price,
      image: imageUrl,
    });

    await course.save();
    const courseObj = course.toObject();
    courseObj.image = getFullImageUrl(courseObj.image, req);

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

    // Convert relative paths to absolute URLs
    const coursesWithFullUrls = courses.map((course) => ({
      ...course.toObject(),
      image: getFullImageUrl(course.image, req),
    }));

    res.json(coursesWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

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

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseObj = updatedCourse.toObject();
    courseObj.image = getFullImageUrl(courseObj.image, req);

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



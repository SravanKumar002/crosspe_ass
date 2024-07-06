const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./Models/User");
const Class = require("./Models/Class");
const Booking = require("./Models/Booking");

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const connectDB = async () => {
  const conn = await mongoose.connect(
    "mongodb+srv://sravankumarega002:<Sravan123>@cluster0.ka0g799.mongodb.net/fitness",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  );
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

app.get("/classes", async (req, res) => {
  const classes = await Class.find();
  res.json(classes);
});

app.post("/book", async (req, res) => {
  const { userId, classId } = req.body;
  const selectedClass = await Class.findById(classId);
  const confirmedBookings = await Booking.countDocuments({
    classId,
    status: "confirmed",
  });

  if (confirmedBookings < selectedClass.capacity) {
    await Booking.create({ userId, classId, status: "confirmed" });
    res.json({ message: "Booking confirmed" });
  } else {
    await Booking.create({ userId, classId, status: "waitlisted" });
    res.json({ message: "Added to waitlist" });
  }
});

app.post("/cancel", async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  booking.status = "cancelled";
  await booking.save();

  const waitlistedBooking = await Booking.findOne({
    classId: booking.classId,
    status: "waitlisted",
  }).sort({ createdAt: 1 });

  if (waitlistedBooking) {
    waitlistedBooking.status = "confirmed";
    await waitlistedBooking.save();
    // Notify the user (e.g., via email)
  }

  res.json({ message: "Booking cancelled and waitlist updated" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

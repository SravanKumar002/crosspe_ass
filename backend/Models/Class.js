// models/Class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Class", classSchema);

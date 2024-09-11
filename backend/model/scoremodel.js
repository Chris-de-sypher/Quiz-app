/** @format */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const scoreSchema = Schema({
  QuizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "QuizCollection",
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  username: {
    type: String,
    required: true,
  },
  useremail: {
    type: String,
    required: true,
  },
  total_score: String,
  datescored: {
    type: Date,
    default: Date.now,
  },
});

const scoremodel = model("score", scoreSchema);

module.exports = scoremodel;

/** @format */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const questionSchema = Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizCollection",
    },
    heading: String,
    options: [String],
    correct_answer: Number,
  },
  { timestamps: true }
);

const questionCollection = model("QuestionCollection", questionSchema);

module.exports = questionCollection;

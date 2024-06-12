/** @format */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const answerSchema = Schema({
  QuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "QuestionCollection",
  },
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
  answer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  score: Number,
  dateanswered: {
    type: Date,
    default: Date.now,
  },
});


const answermodel = model('answer', answerSchema);

module.exports = answermodel;
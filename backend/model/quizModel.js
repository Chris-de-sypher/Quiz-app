/** @format */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const quizSchema = Schema(
  {
    title: String,
    description: String,
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionCollection",
      },
    ],
    start_date: {
      type: Date,
      required: true,
    },
    expired_date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    score_mark_per_question: {
      type: Number,
      required: true,
    },
    total_score_percentage: {
      type: Number,
      required: true,
    },
    participant_email: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }],
    participant_username: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }],
    expired_data: Date,
    total_number_of_question: Number,
    get_email_notification: Boolean,
    generate_unique_link: String,
  },
  { timestamps: true }
);

const quizCollection = model("QuizCollection", quizSchema);

module.exports = quizCollection;

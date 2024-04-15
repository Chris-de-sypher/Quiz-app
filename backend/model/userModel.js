/** @format */

const mongooose = require("mongoose");

const { Schema, model } = mongooose;

// Schema for users
const userSchema = Schema(
  {
    username: String,
    email: String,
    password: String,
    quiz_Id: [
      {
        type: mongooose.Schema.Types.ObjectId,
        ref: "QuizCollection",
      },
    ],
    userAvatar: String,
  },
  { timestamps: true }
);

const userCollection = model("user", userSchema);

module.exports = userCollection;

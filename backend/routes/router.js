/** @format */

const express = require("express");
const router = express.Router(); // Use express.Router() to create a router instance
const { resolve } = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});




const upload = multer({ storage: storage });

const {
  Signup,
  landingPage,
  loginPage,
  signupPage,
  dashboard,
  login,
  logout,
  usernamePage,
  userName,
  quizPage,
  quiz,
  questionPage,
  question,
  confirm,
  changePassword,
  getUserProfile,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  updateUserAvatar,
  AnswerQuestion,
  getQuestions,
  userdetailPage,
  questionAnswered,
  emailNotification
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/userAuth");

router.get("/", landingPage);
router.get("/dashboard", isAuthenticated, dashboard);
router.get("/signup", signupPage);
router.get("/login", loginPage);
router.get("/username", isAuthenticated, usernamePage);
router.get("/quiz", isAuthenticated, quizPage);
router.get("/question", isAuthenticated, questionPage);
router.get("/confirm", isAuthenticated, confirm);
router.get("/getuserprofile", getUserProfile);
router.get("/getuserquiz", getQuiz);
router.get("/answerquestion", isAuthenticated, AnswerQuestion);
router.get("/userdetials", isAuthenticated, userdetailPage);
router.get("/getquestions/:QuizID", isAuthenticated, getQuestions);
router.post("/signup", upload.single("avatar"), Signup);
router.post("/login", login);
router.post("/username", userName);
router.post("/quiz", quiz);
router.post("/question", question);
router.post("/changepassword", changePassword);
router.post("/updatequiz", updateQuiz);
router.post("/deletequiz", deleteQuiz);
router.post("/updateuseravatar", upload.single("avatar"), updateUserAvatar);
router.post("/saveanswer", questionAnswered);
router.post("/emailNotification", isAuthenticated, emailNotification)
router.post("/logout", logout);

module.exports = router;

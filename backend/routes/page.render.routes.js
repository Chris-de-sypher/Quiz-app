const express = require("express");
const router = express.Router(); 

// page render controller
const {
    landingPage, loginPage, signupPage, dashboard, usernamePage, forgetpasswordPage, quizPage, questionPage, confirm, AnswerQuestion, userdetailPage } = require("../controllers/pagerender");

//   session
const { isAuthenticated } = require("../middleware/userAuth");



router.get("/", landingPage);
router.get("/dashboard", isAuthenticated, dashboard);
router.get("/signup", signupPage);
router.get("/login", loginPage);
router.get("/username", isAuthenticated, usernamePage);
router.get('/forgetpassword', forgetpasswordPage)
router.get("/quiz", isAuthenticated, quizPage);
router.get("/question", isAuthenticated, questionPage);
router.get("/answerquestion", isAuthenticated, AnswerQuestion);
router.get("/userdetails", isAuthenticated, userdetailPage);
router.get("/confirm", isAuthenticated, confirm);


module.exports = router;

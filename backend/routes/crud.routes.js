const express = require("express");
const router = express.Router(); 
const multer = require("multer");

// crud controller
const {
    quiz,
    question,
    changePassword,
    getUserProfile,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    deleteSingleQuiz,
    updateUserAvatar,
    getQuestions,
    questionAnswered,
    emailNotification,
    dataReport,
} = require("../controllers/crud");

const { isAuthenticated } = require("../middleware/userAuth");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage: storage });


router.get("/getuserprofile", getUserProfile);
router.get("/getuserquiz", getQuiz);
router.post("/emailNotification", isAuthenticated, emailNotification)
router.get("/getquestions/:QuizID", isAuthenticated, getQuestions);
router.get("/userreportchart", isAuthenticated, dataReport)
router.post("/question", question);
router.post("/changepassword", changePassword);
router.post("/updatequiz", updateQuiz);
router.delete("/deletequiz/:ID", deleteSingleQuiz); // for single reuest
router.delete("/deletequiz", deleteQuiz); // for multiple reuest
router.post("/updateuseravatar", upload.single("avatar"), updateUserAvatar);
router.post("/saveanswer", questionAnswered);
router.post("/quiz", quiz);


module.exports = router;

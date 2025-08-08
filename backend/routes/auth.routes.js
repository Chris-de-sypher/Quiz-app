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

// user authentication controller
const { Signup, login,
  logout,
  userName, forgetPassword } = require("../controllers/userAuth");

const { isAuthenticated } = require("../middleware/userAuth");



router.post("/signup", upload.single("avatar"), Signup);
router.post("/login", login);
router.post("/username", userName);
router.post('/forgetpassword', forgetPassword)

router.post("/logout", logout);

module.exports = router;

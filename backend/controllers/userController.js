/** @format */

const userCollection = require("../model/userModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const quizCoollection = require("../model/quizModel");
const questionCollection = require("../model/QuestionModel");

const landingPage = (req, res) => {
  res.render("landingPage");
};

const loginPage = (req, res) => {
  res.render("loginPage");
};

const signupPage = (req, res) => {
  res.render("SignupPage");
};

const dashboard = async (req, res) => {
  // Check if user is authenticated
  if (!req.session.email) {
    return res.status(401).redirect("/user/v1/login");
  }

  try {
    // Find the user by email
    const findUser = await userCollection.findOne({ email: req.session.email });

    // If user or avatar is not found, redirect to login page
    if (!findUser || !findUser.userAvatar) {
      return res.status(404).redirect("/user/v1/login");
    }

    const data = {
      avatar: findUser.userAvatar,
    };

    // Render dashboard with user avatar
    return res.status(200).render("dashBoard", data);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

const usernamePage = async (req, res) => {
  const userSessionEmail = req.session.email;

  const user = await userCollection.findOne({ email: userSessionEmail });

  // If user's username is empty or user not found, render the username page
  if (!user || !user.username) {
    return res.render("username");
  }

  // If user's username is not empty, redirect to the quiz page
  res.redirect("/user/v1/quiz");
};

const quizPage = (req, res) => {
  res.render("quizPage");
};

const questionPage = async (req, res) => {
  const { quiz_id } = req.session;

  const quizid = await quizCoollection.findById({ _id: quiz_id });

  if (!quizid || !quizid.title || !quizid.description) {
    return res.status(404).redirect("/user/v1/quiz");
  }

  let length_of_questions = quizid.questions.length;
  let total_number_of_questions = quizid.total_number_of_question;

  const data = {
    title: quizid.title,
    desc: quizid.description,
    length_of_questions,
    total_number_of_questions,
  };

  return res.status(200).render("question", data);
};

// confirmation page
const confirm = (req, res) => {
  res.render("confirm");
};

// signup route
const Signup = async (req, res) => {
  const { email, password } = req.body;

  // Check if email is a string and contains "@", and password is not empty
  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof password !== "string" ||
    password === ""
  ) {
    return res.status(400).send({ Errmsg: "Invalid email or password" });
  }

  try {
    // Check if a user with the provided email already exists
    const existingUser = await userCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ Errmsg: "User already exists" });
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send({ Errmsg: "Avatar file is required" });
    }

    // Hash the password
    const hashedPw = await bcrypt.hash(password, 12);

    // Save the filename or file path to the user document in the database
    const newUser = new userCollection({
      email,
      password: hashedPw,
      userAvatar: req.file.filename,
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect the user to the login page after successful signup
    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).send({ msg: "Failed to save data" });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await userCollection.findOne({ email });

    if (!existingUser) {
      return res.status(404).redirect("/user/v1/login");
    }

    const checkPass = await bcrypt.compare(password, existingUser.password);

    if (!checkPass) {
      return res.status(400).send({ Errmsg: "Incorrect password" });
    }

    req.session.isAuthenticated = true;
    req.session.email = email;
    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ Errmsg: "Internal Server Error" });
  }
};

// logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/user/v1/");
  });
};

// username
const userName = async (req, res) => {
  const { username } = req.body;

  console.log(req.session);

  if (!req.session.isAuthenticated) {
    return res.status(401).redirect("/user/v1/login");
  }

  try {
    const email = req.session.email;
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    user.username = username;
    await user.save();
    res.status(200).redirect("/user/v1/quiz");
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Failed to add username" });
  }
};

// create the quiz section api
const quiz = async (req, res) => {
  const {
    title,
    description,
    start_date,
    expired_date,
    duration,
    score_mark_per_question,
    total_score_percentage,
    selectedValue,
    total_number_of_question,
  } = req.body;
  const email = req.session.email;

  if (!title.trim() || !description.trim()) {
    return res.status(400).send({ ErrMsg: "Invalid title and description" });
  }

  try {
    const LookupTitle = await quizCoollection.findOne({ title });
    const findUser = await userCollection.findOne({ email });

    if (!findUser) {
      return res.status(404).send({ ErrMsg: "User not found" });
    }

    if (LookupTitle) {
      return res.status(400).send({ ErrMsg: "Title already exists" });
    }

    const created_by = findUser._id;

    const newQuiz = new quizCoollection({
      title,
      description,
      created_by,
      duration,
      score_mark_per_question,
      total_score_percentage,
      get_email_notification: Boolean(selectedValue),
      total_number_of_question,
      start_date: new Date(start_date),
      expired_date: new Date(expired_date),
    });

    const savedQuiz = await newQuiz.save();
    req.session.quiz_id = savedQuiz._id.toString();

    await userCollection.findByIdAndUpdate(
      { _id: created_by },
      { $push: { quiz_Id: savedQuiz._id } }
    );

    // create a unique link
    const baseUrl = `http://localhost/user/v1/get_quiz/:${savedQuiz._id}`;
    console.log(baseUrl);

    // encode the url
    const encodeUrL = encodeURIComponent(baseUrl);

    newQuiz.generate_unique_link = encodeUrL;

    await savedQuiz.save();
    res.status(200).send({ success: true, Link: encodeUrL });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Internal server error" });
  }
};

// submit questions
const question = async (req, res) => {
  const { heading, option1, option2, option3, option4, correctAnswer } =
    req.body;

  // quiz id from the session
  const { quiz_id } = req.session;

  // check for the value of the correct answer ensuring it's not above 4 or below 1
  if (correctAnswer < 1 || correctAnswer > 4) {
    return res.status(400).send({ ErrMsg: "Invalid correct answer" });
  }
  // input our options into the array
  const options = [option1, option2, option3, option4];

  // making the user input of correctanswer match with the array zero base logic
  const correctAnswerIndex = Number(correctAnswer) - 1;

  try {
    const newData = new questionCollection({
      quiz_id: quiz_id,
      heading,
      options,
      correct_answer: correctAnswerIndex,
    });

    const savedQuestion = await newData.save();

    // update the quizmodel by adding the questionId
    await quizCoollection.findByIdAndUpdate(
      { _id: quiz_id },
      {
        $push: { questions: savedQuestion._id },
      }
    );

    // get the tottal number using the quiz id session
    const quizData = await quizCoollection.findById({ _id: quiz_id });

    // getting the total number of question from the quizmodel
    const totalNumber = quizData.total_number_of_question;

    // convert the totalNumber to a number
    let number_of_question = parseInt(totalNumber);
    console.log(number_of_question);

    // get the length of question from the quizmodel of questions
    const quiz_of_questions = quizData.questions.length;
    console.log(quiz_of_questions);

    if (Number(quiz_of_questions) >= number_of_question) {
      return res.send({ limit: true });
    }

    return res.status(200).send({
      success: "Data saved successfully",
      number_questions: quiz_of_questions,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: "Internal error" });
  }
};

// change password
const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const { email } = req.session;

  try {
    // get user and also check if the user exist
    const existingUser = await userCollection.findOne({ email });

    if (!existingUser) {
      return res.status(404).redirect("/user/v1/login");
    }

    // check for the password
    const getPassword = await bcrypt.compare(
      old_password,
      existingUser.password
    );

    if (!getPassword) {
      return res.status(400).send({ ErrMsg: "Invalid password" });
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    existingUser.password = hashedPassword;

    await existingUser.save();

    return res.status(200).send({ ErrMsg: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: "FInternal server error" });
  }
};

// get the userprofile
const getUserProfile = async (req, res) => {
  const { email } = req.session;
  try {
    const getUser = await userCollection.findOne({ email });

    if (!getUser) {
      res.status(404).redirect("/user/v1/login");
    }

    res.status(200).send({ Email: getUser.email, Username: getUser.username });
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: "FInternal server error" });
  }
};

// lets get the quiz
const getQuiz = async (req, res) => {
  const { email } = req.session;

  const findUser = await userCollection.findOne({ email });

  if (!findUser) {
    return res.status(404).redirect("/user/v1/login");
  }

  // get the quizzes
  let getUserQuiz;

  // Get the user's quiz IDs
  getUserQuiz = findUser.quiz_Id;
  if (!getUserQuiz || getUserQuiz.length === 0) {
    console.log(getUserQuiz.length);
    return res.status(404).json({ message: "No quizzes found for this user." });
  }

  console.log(...getUserQuiz);

  // Fetch the quizzes from the quiz collection using the IDs
  try {
    const quizzes = await quizCoollection.find({
      _id: { $in: getUserQuiz },
    });

    if (!quizzes) {
      return res.status(404).json({ message: "Quizzes not found." });
    }

    console.log(quizzes);

    // Assuming you want to send the quizzes back in the response
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return res.status(500).json({ message: "Error fetching quizzes." });
  }
};

// update each item in the quiz model
const updateQuiz = async (req, res) => {
  const {
    quizID,
    title,
    description,
    start_date,
    expired_date,
    duration,
    score_mark_per_question,
    total_score_percentage,
    total_number_of_question,
  } = req.body;

  console.log(title);

  try {
    // update the title
    if (title) {
      const updateTitle = await quizCoollection.findById({ _id: quizID });

      updateTitle.title = title;

      await updateTitle.save();

      return res.status(200).json({ success: true });
    }
    // update the description
    if (description) {
      const updateDesc = await quizCoollection.findById({ _id: quizID });

      updateDesc.description = description;

      await updateDesc.save();

      return res.status(200).json({ success: true });
    }
    // update the start date
    if (start_date) {
      const updateStartDate = await quizCoollection.findById({ _id: quizID });

      updateStartDate.start_date = start_date;

      await updateStartDate.save();

      return res.status(200).json({ success: true });
    }
    // update the end date
    if (expired_date) {
      const updateExpDate = await quizCoollection.findById({ _id: quizID });

      updateExpDate.expired_date = expired_date;

      await updateExpDate.save();

      return res.status(200).json({ success: true });
    }
    // update the duration
    if (duration) {
      const updateDuration = await quizCoollection.findById({ _id: quizID });

      updateDuration.duration = duration;

      await updateDuration.save();

      return res.status(200).json({ success: true });
    }
    // update the score_mark_per_question
    if (score_mark_per_question) {
      const updateScorePerQues = await quizCoollection.findById({
        _id: quizID,
      });

      updateScorePerQues.score_mark_per_question = score_mark_per_question;

      await updateScorePerQues.save();

      return res.status(200).json({ success: true });
    }
    // update the total_score_percentage
    if (total_score_percentage) {
      const updateTotalScore = await quizCoollection.findById({ _id: quizID });

      updateTotalScore.total_score_percentage = total_score_percentage;

      await updateTotalScore.save();

      return res.status(200).json({ success: true });
    }
    // update the total_number_of_question
    if (total_number_of_question) {
      const updateTotalNumQues = await quizCoollection.findById({
        _id: quizID,
      });

      updateTotalNumQues.total_number_of_question = total_number_of_question;

      await updateTotalNumQues.save();

      return res.status(200).json({ success: true });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Unable to update" });
  }
};

// delete the quiz
const deleteQuiz = async (req, res) => {
  const { quizID } = req.body;

  try {
    if (!quizID) {
      return res.status(404).send({ error: "Not found" });
    }
    await quizCoollection.findByIdAndDelete({ _id: quizID });

    return res.status(200).send({ success: "Deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Bad request" });
  }
};

// update the user dp
const updateUserAvatar = async (req, res) => {
  const { email } = req.session;
  if (!email) {
    return res.status(401).redirect("/user/v1/login");
  }
  try {
    const findUser = await userCollection.findOne({ email });
    if (!findUser) {
      return res.status(404).redirect("/user/v1/login");
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send({ Errmsg: "Avatar file is required" });
    }

    findUser.userAvatar = req.file.filename;
    await findUser.save();

    return res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: "Internal server error" });
  }
};

module.exports = {
  Signup,
  login,
  landingPage,
  loginPage,
  signupPage,
  dashboard,
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
};

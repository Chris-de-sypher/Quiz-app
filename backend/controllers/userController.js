/** @format */

const userCollection = require("../model/userModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const quizCoollection = require("../model/quizModel");
const questionCollection = require("../model/QuestionModel");
const answerCollection = require("../model/answersModel");
const mongoose = require("mongoose");
const transporter = require("../service/emailServiceNodemailer");
const scoreCollection = require("../model/scoremodel");

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

const AnswerQuestion = async (req, res) => {
  // Check if user is authenticated
  if (!req.session.email) {
    return res.status(401).redirect("/user/v1/login");
  }

  try {
    // Find the user by email
    const findUser = await userCollection.findOne({ email: req.session.email });

    // If user or avatar is not found, redirect to login page
    if (!findUser || !findUser.userAvatar || !findUser.username) {
      return res.status(404).redirect("/user/v1/login");
    }

    const data = {
      avatar: findUser.userAvatar,
      username: findUser.username,
    };

    // Render dashboard with user avatar
    return res.status(200).render("displayQuestion", data);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

// render the userdetail page
const userdetailPage = (req, res) => {
  res.render("userdetailsanswer");
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
    email_notifications,
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
      get_email_notification: email_notifications,
      total_number_of_question,
      start_date: new Date(start_date),
      expired_date: new Date(expired_date),
    });

    // Ensure the dates are valid
    if (
      isNaN(newQuiz.start_date.getTime()) ||
      isNaN(newQuiz.expired_date.getTime())
    ) {
      return res.status(400).send({ ErrMsg: "Invalid dates provided" });
    }

    const savedQuiz = await newQuiz.save();
    req.session.quiz_id = savedQuiz._id.toString();

    await userCollection.findByIdAndUpdate(
      { _id: created_by },
      { $push: { quiz_Id: savedQuiz._id } }
    );

    // create a unique link
    const baseUrl = `${savedQuiz._id}`;

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

  // input our options into the array
  const options = [option1, option2, option3, option4];

  // loop through the array of options;
  // Check if the correctAnswer is within the options
  const correctAnswerIndex = options.indexOf(correctAnswer);
  if (correctAnswerIndex === -1) {
    return res.status(400).send({ ErrMsg: "Invalid correct answer" });
  }

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

    // get the length of question from the quizmodel of questions
    const quiz_of_questions = quizData.questions.length;

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

  try {
    // Find the user
    const findUser = await userCollection.findOne({ email });
    if (!findUser) {
      return res.status(404).redirect("/user/v1/login");
    }

    // Get the user's quiz IDs
    const userQuizzes = findUser.quiz_Id;
    if (!userQuizzes || userQuizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this user." });
    }

    // Fetch the quizzes from the quiz collection using the IDs
    const quizzes = await quizCoollection.find({ _id: { $in: userQuizzes } });
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found." });
    }

    // Send the quizzes in the response
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
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Unable to update" });
  }
};

// delete the quiz
const deleteQuiz = async (req, res) => {
  const { quizID } = req.body;
  const { email } = req.session;

  try {
    if (!quizID) {
      return res.status(404).send({ error: "Not found" });
    }
    let deletedQuizQuestions = await quizCoollection.findByIdAndDelete({
      _id: quizID,
    });

    // get the question id from the deleted quiz
    let getQuestionsID = deletedQuizQuestions.questions;
    // now call the question document and parse the id to delete
    await questionCollection.findByIdAndDelete({
      _id: getQuestionsID,
    });

    // get the user who created the quiz and delete the quiz from the user array of quizes
    const userQuiz = await userCollection.findOne({ email });

    if (!userQuiz) {
      return res.status(404).send({ error: "Quiz id not found" });
    }

    let deletedQuiz = userQuiz.quiz_Id.filter((q) => q.toString() !== quizID);
    userQuiz.quiz_Id = deletedQuiz;

    await userQuiz.save();

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

// get the questions from the quiz
const getQuestions = async (req, res) => {
  const quizID = req.params.QuizID;

  try {
    // find the quiz
    const findQuiz = await quizCoollection.findById({ _id: quizID });

    // let check if email notification was enabled for this quiz by the creator
    let emailNotification = findQuiz.get_email_notification;

    if (!findQuiz) {
      return res.status(404).send({ msg: "return the 404 page" });
    }

    // get the questions
    let questionsID = findQuiz.questions;

    const findQuestions = await questionCollection.find({
      _id: { $in: questionsID },
    });

    if (!findQuestions) {
      return res.status(404).json({ message: "Questions not found." });
    }

    // now get the headers
    const headers = {
      quiz_id: findQuiz._id,
      quiz_name: findQuiz.title,
      passing_grade: findQuiz.total_score_percentage,
      number_of_question: findQuiz.total_number_of_question,
      score_mark_per_question: findQuiz.score_mark_per_question,
      duration: findQuiz.duration,
    };

    return res.status(200).send({
      headTitles: headers,
      questions: findQuestions,
      emailNot: emailNotification,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Internal server error" });
  }
};

// userdetails
// const userdetails = async (req, res) => {
//   const { username, email } = req.body;

//   if (!username || !email) {
//     return res.status(400).send({err: "Not valid"})
//   }

//   try {

//   }
//   catch (errs) {
//     console.log(errs);
//     return res.status(400).send({Err: "Internal server error"})
//   }
// };

// store the answers in the database
const questionAnswered = async (req, res) => {
  const { email } = req.session;
  const { quizID, questionID, correctanswer, participantEMail } = req.body;

  let score;
  let userPercentage;

  if (!email) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!quizID || !questionID || !correctanswer || !participantEMail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const checkingUserID = await userCollection.findOne({
      email: participantEMail,
    });
    if (!checkingUserID) {
      return res.status(404).json({ error: "User not found" });
    }

    const checkingQuizID = await quizCoollection.findById(quizID);
    if (!checkingQuizID) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const checkingQuestionID = await questionCollection.findById(questionID);
    if (!checkingQuestionID) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Check if the user has already answered the question
    const existingAnswer = await answerCollection.findOne({
      UserId: checkingUserID._id,
      QuizId: quizID,
      QuestionId: questionID,
    });

    if (existingAnswer) {
      return res.status(400).json({ error: "Question answered already" });
    }

    let correctIndex = checkingQuestionID.options.indexOf(correctanswer);
    let checkingCorrectanswer = checkingQuestionID.correct_answer;
    let isCorrect = String(correctIndex) === String(checkingCorrectanswer);

    // setting the user score for each question
    if (isCorrect) {
      score = Number(checkingQuizID.score_mark_per_question);
    }

    if (!isCorrect) {
      score = 0;
    }

    const answerData = {
      QuizId: quizID,
      QuestionId: questionID,
      UserId: checkingUserID._id,
      answer: String(correctIndex),
      isCorrect,
      score,
    };

    const savedanswer = new answerCollection(answerData);

    // we wanna check for the length of the answers in the answer collection to determine if the it matches with the length of the questions in the quiz collection then we return the total score for the user;

    // question collection count
    const questionIds = checkingQuizID.questions;
    const questions = await questionCollection.find({
      _id: { $in: questionIds },
    });

    // Get the length of the questions array
    const questionCount = questions.length;

    console.log(questionCount);

    const quizIDS = checkingUserID.quiz_Id;
    const answerCheck = await answerCollection.find({
      QuizId: { $in: quizIDS },
    });

    let answerCount = Number(answerCheck.length);

    // add one to every increment
    answerCount++;

    let compareLength = Number(answerCount) === Number(questionCount);

    // once the data is saved then we use it to determine the total score for the user
    const saved = await savedanswer.save();
    if (saved) {
      if (compareLength) {
        // get the total score for the quiz
        let total_score = checkingQuizID.total_score_percentage;

        // calculate the user possbile score by multiplying the user score per question by the total number of questions;
        // let userScore_perQuestion = checkingQuizID.score_mark_per_question;

        let userPossible_score = Number(total_score);

        // now get the total score the user got right and add them together;
        // Retrieve all the answers for the given quizID
        const userScore = await answerCollection.find({ QuizId: quizID });

        console.log(userScore);

        let questionScore = 0;

        userScore.forEach((item) => {
          questionScore += Number(item.score);
        });

        let totalScore = (questionScore / userPossible_score) * 100;

        console.log(totalScore + "%");

        return res.status(200).json({ accumulatedScore: totalScore + "%" });
      }
    }

    return res.status(200).json({ message: "Answer submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// check the quiz creator enabled email notification
const emailNotification = async (req, res) => {
  const { username, useremail, quizID, total_score } = req.body;
  const { email } = req.session;
  const user = await userCollection.findOne({ email });

  if (!user) {
    return res.status(401).json({ msg: "User not found" });
  }

  const findQuizID = await quizCoollection.findById(quizID);
  if (!findQuizID) {
    return res.status(401).json({ error: "Quiz not found" });
  }

  // created_by
  let created_by = findQuizID.created_by;

  // store the informations in the scoremodel
  const newdata = {
    QuizId: quizID,
    UserId: user._id,
    created_by,
    total_score,
    username,
    useremail,
  };

  const savescore = new scoreCollection(newdata);

  try {
    await savescore.save();

    const mailOptions = {
      from: user.email,
      to: useremail,
      subject: findQuizID.title,
      html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333;"> <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"> <div style="background-color: #4caf50; padding: 10px; border-radius: 5px; color: #ffffff; text-align: center;"><h1 style="margin: 0; font-size: 24px;">Quiz Results</h1></div> <div style="margin-top: 20px;"><p style="font-size: 16px; line-height: 1.5;"><strong>Quiz Title:</strong> <span id="quizTitle">${findQuizID.title}</span></p><p style="font-size: 16px; line-height: 1.5;"><strong>Score:</strong> <span id="score">${total_score}</span> </p><p style="font-size: 16px; line-height: 1.5;"><strong>Created By:</strong> <span id="createdBy">${user.email}</span></p></div><div style="margin-top: 20px; font-size: 12px; text-align: center; color: #777;"><p>This is an automated message. Please do not reply to this email.</p></div></div></body>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (err) {
    console.log(err);
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
  AnswerQuestion,
  getQuestions,
  userdetailPage,
  questionAnswered,
  emailNotification,
};

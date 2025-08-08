/** @format */

const userCollection = require("../model/userModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const quizCoollection = require("../model/quizModel");
const questionCollection = require("../model/QuestionModel");
const answerCollection = require("../model/answersModel");
// const mongoose = require("mongoose");
const transporter = require("../service/emailServiceNodemailer");
const scoreCollection = require("../model/scoremodel");
// import the socket instance
// const io = require('../server');


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
      return res.status(404).redirect("/api/v1/pages/login");
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
      res.status(404).redirect("/api/v1/pages/login");
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
      return res.status(404).redirect("/api/v1/pages/login");
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
    return res.status(200).json({ quiz: quizzes });
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return res.status(500).json({ message: "Error fetching quizzes." });
  }
};

// update each item in the quiz model
const updateQuiz = async (req, res) => {
  const { quizID, ...updateFields } = req.body;

  try {
    // Check if quizID is provided
    if (!quizID) {
      return res.status(400).json({ error: "Quiz ID is required" });
    }

    // Find and update the quiz in one query
    const updatedQuiz = await quizCoollection.findByIdAndUpdate(
      quizID,
      { $set: updateFields }, // Update only the provided fields
      { new: true } // Return the updated document
    );

    // If no quiz found, return error
    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    return res.status(200).json({ success: true, updatedQuiz });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// delete the multiple quiz
const deleteQuiz = async (req, res) => {
  const { IDS } = req.body;
  const { email } = req.session;

  try {
    if (!IDS || IDS.length === 0) {
      return res.status(404).json({ error: "No quiz IDs provided" });
    }

    // Step 1: Fetch the quizzes before deleting
    const quizzesToDelete = await quizCoollection.find({ _id: { $in: IDS } });

    if (quizzesToDelete.length === 0) {
      return res.status(404).json({ message: "No quizzes found to delete" });
    }

    // Extract question IDs from the quizzes
    const getQuestionsID = quizzesToDelete.flatMap((quiz) => quiz.questions);

    // Step 2: Delete the quizzes
    await quizCoollection.deleteMany({ _id: { $in: IDS } });

    // Step 3: Delete related questions
    await questionCollection.deleteMany({ _id: { $in: getQuestionsID } });

    // Step 4: Remove quiz IDs from user model
    const userQuiz = await userCollection.findOne({ email });

    if (!userQuiz) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove the deleted quiz IDs from the user's quiz array
    userQuiz.quiz_Id = userQuiz.quiz_Id.filter((q) => !IDS.includes(q.toString()));

    await userQuiz.save();

    // Step 5: Find remaining quizzes and emit an update
    const remainingQuizzes = await quizCoollection.find({ _id: { $in: userQuiz.quiz_Id } });

    // io.emit("updateQuiz", remainingQuizzes);

    return res.status(200).json({ success: "Deleted successfully", Quiz: remainingQuizzes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// Delete single quiz
const deleteSingleQuiz = async (req, res) => {
  const Id = req.params.ID;
  const { email } = req.session;

  try {
    if (!Id) {
      return res.status(404).json({ error: "Quiz ID not provided" });
    }

    // Delete quiz from quizCollection
    const deletedQuiz = await quizCoollection.findOneAndDelete({ _id: Id });

    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Delete associated questions
    const getQuestionsID = deletedQuiz.questions; // Ensure questions field exists
    if (getQuestionsID) {
      await questionCollection.deleteOne({ _id: getQuestionsID });
    }

    // Remove quiz from user's array of quizzes
    const userQuiz = await userCollection.findOne({ email });

    if (!userQuiz) {
      return res.status(404).json({ error: "User not found" });
    }

    userQuiz.quiz_Id = userQuiz.quiz_Id.filter((q) => q.toString() !== ID);
    await userQuiz.save();

    // Fetch remaining quizzes
    const remainingQuiz = userQuiz.quiz_Id;
    const findQuiz = await quizCoollection.find({ _id: { $in: remainingQuiz } });

    return res.status(200).json({ success: "Deleted successfully", Quiz: findQuiz });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



// update the user dp
const updateUserAvatar = async (req, res) => {
  const { email } = req.session;
  if (!email) {
    return res.status(401).redirect("/api/v1/pages/login");
  }
  try {
    const findUser = await userCollection.findOne({ email });
    if (!findUser) {
      return res.status(404).redirect("/api/v1/pages/login");
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
  const {
    quizID,
    questionID,
    correctanswer,
    participantEMail,
    participantName,
  } = req.body;

  console.log(typeof participantEMail);

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

        //

        return res.status(200).json({ accumulatedScore: totalScore + "%" });
      }

      // find the userID using the participant email address
      const findUserID = await userCollection.findOne({ email: participantEMail })

      // check if it's registered in our db
      if (!findUserID) {
        return res.status(401).redirect('/api/v1/pages/login')
      }

      // update the quizcollection
      await quizCoollection.findByIdAndUpdate(quizID, {
        $push: {
          participant_ID: findUserID._id,
        },
      });
    }

    return res.status(200).json({ message: "Answer submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// check the quiz creator enabled email notification // send email notification
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

// user data report from the database
const dataReport = async (req, res) => {
  try {
    // user on session
    const { email } = req.session;
    // using the email to check if the user exist
    const findUser = await userCollection.findOne({ email });

    if (!findUser) {
      return res.status(401).redirect("/login");
    }

    // get the user ID
    const userID = findUser._id;

    // get the quiz
    const findUserQuiz = findUser.quiz_Id;

    // check if no quiz is found;
    if (findUserQuiz.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this user." });
    }

    // now we itterate throught the quiz collection using the quiz iDS
    const findQuiz = await quizCoollection.find({ _id: { $in: findUserQuiz } })

    if (!findQuiz || findQuiz.length === 0) {
      return res.status(404).json({ message: "No quizzes found." });
    }

    // now we get the number of users that participated in the quiz created by this user
    let findUsersEngaged;
    for (let i = 0; i < findQuiz.length; i++) {

      const userEngaged = findQuiz[i].participant_ID;

      findUsersEngaged = await userCollection.find({ _id: { $in: userEngaged } })

      console.log(findUsersEngaged.length)

    }

    // find the users engaged in the quiz

    // get the number of quiz
    return res.status(200).json({ quizLength: findQuiz.length, participants: findUsersEngaged.length })


  } catch (err) {
    console.error("Error in dataReport:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
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
};

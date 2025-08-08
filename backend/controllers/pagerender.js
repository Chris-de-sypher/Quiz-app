const userCollection = require("../model/userModel");
const quizCoollection = require("../model/quizModel");
// import the socket instance
const io = require('../server');


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
        return res.status(401).redirect("/api/v1/pages/login");
    }

    try {
        // Find the user by email
        const findUser = await userCollection.findOne({ email: req.session.email });

        // If user or avatar is not found, redirect to login page
        if (!findUser || !findUser.userAvatar) {
            return res.status(404).redirect("/api/v1/pages/login");
        }

        // get the length of user quiz
        const userQuiz = findUser.quiz_Id;
        console.log(userQuiz.length);

        const data = {
            avatar: findUser.userAvatar,
            quizLength: userQuiz.length
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
    res.redirect("/api/v1/pages/quiz");
};

// forgetpassword page
const forgetpasswordPage = (req, res) => {
    res.render('forgetpassword')
}

// render the quiz page
const quizPage = async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).redirect('/api/v1/pages/login')
    }
    try {
        const { email } = req.session;

        // check if the user exist in our database
        const findUser = await userCollection.findOne({ email });

        if (!findUser) {
            return res.status(401).redirect('/api/v1/pages/login')
        }

        // Check if the username is empty or undefined
        if (!findUser.username || findUser.username.trim() === "") {
            return res.status(401).redirect('/api/v1/pages/username'); // Redirect if username is empty
        }

        // If username is not empty, render the quiz page
        return res.status(200).render('quizPage');
    }
    catch (err) {
        console.log(err);

    }
};

const questionPage = async (req, res) => {
    const { quiz_id } = req.session;

    const quizid = await quizCoollection.findById({ _id: quiz_id });

    if (!quizid || !quizid.title || !quizid.description) {
        return res.status(404).redirect("/api/v1/pages/quiz");
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
        return res.status(401).redirect("/api/v1/pages/login");
    }

    try {
        // Find the user by email
        const findUser = await userCollection.findOne({ email: req.session.email });

        // If user or avatar is not found, redirect to login page
        if (!findUser || !findUser.userAvatar || !findUser.username) {
            return res.status(404).redirect("/api/v1/pages/login");
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
const userdetailPage = async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).redirect('/api/v1/pages/login')
    }
    try {
        const { email } = req.session;

        // check if the user exist in our database
        const findUser = await userCollection.findOne({ email });

        if (!findUser) {
            return res.status(401).redirect('/api/v1/pages/login')
        }

        // Check if the username is empty or undefined
        if (!findUser.username || findUser.username.trim() === "") {
            return res.status(401).redirect('/api/v1/pages/username'); // Redirect if username is empty
        }

        // if it's not empty then the user will be directed to the userdetailpage
        return res.status(200).render('userdetailsanswer')

    }
    catch (err) {
        console.log(err);

    }
};


module.exports = { landingPage, loginPage, signupPage, dashboard, usernamePage, forgetpasswordPage, quizPage, questionPage, confirm, AnswerQuestion, userdetailPage };
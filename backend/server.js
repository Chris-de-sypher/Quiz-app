/** @format */

const express = require("express");
const app = express();
require('./Database/db')
const io = require('socket.io');
const { createServer } = require('http');
const router = require('./routes/router')
const session = require("express-session");
const mongodbSession = require('connect-mongodb-session')(session)
require('dotenv').config();
const { resolve } = require("path");
require("ejs");
// quiz model
const quizCollection = require('./model/quizModel')

const server = createServer(app);

// setting up our middleware to receive response from the server;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user/v1/image', express.static(resolve(__dirname, "../frontend/src/image")));
app.use(
  "/user/v1/script",
  express.static(resolve(__dirname, "../frontend/src/script"))
);
app.use(
  "/user/v1/styles",
  express.static(resolve(__dirname, "../frontend/src/styles"))
);
app.use("/user/v1/uploads", express.static(resolve(__dirname, './uploads')))

// Setting up the ejs template
app.set("view engine", "ejs");
app.set("views", resolve(__dirname, "../frontend/src/template"));

const store = new mongodbSession({
  uri: "mongodb://localhost:27017/QuizApp",
  collection: "quizUserSession",
});

app.use(
  session({
    secret: "abcdefghijklmnopqrstuv12345767",
    resave: false,
    saveUninitialized: true,
    store: store
  })
);

// setting the router
app.use("/user/v1/", router);

const Server = new io.Server(server);

Server.on('connection', async (socket) => {
    console.log('coonection established and stable');

    socket.on('disconnect', () => {
        console.log('connection lost and user disconnected');
    })
})

server.listen(4000, () => {
    console.log('Server is running on 4000');
})
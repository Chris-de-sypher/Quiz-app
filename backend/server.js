/** @format */

// express routes
const express = require("express");
const app = express();

// initialize the db
require('./config/db')

// socket
const io = require('socket.io');

// http server
const { createServer } = require('http');

// routes
const authRoutes = require('./routes/auth.routes')
const crudRoutes = require('./routes/crud.routes')
const page_render_routes = require('./routes/page.render.routes')


const session = require("express-session");
const mongodbSession = require('connect-mongodb-session')(session)
require('dotenv').config();
const { resolve } = require("path");
require("ejs");

// port
const port = process.env.PORT || 5000
// quiz model
const quizCollection = require('./model/quizModel')

const server = createServer(app);



// Setting up the ejs template
app.set("view engine", "ejs");
app.set("views", [
  resolve(__dirname, "../frontend/src/template/"),
  resolve(__dirname, "../frontend/src/template/auth"),
  resolve(__dirname, "../frontend/src/template/quizpage")
]);

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



// setting up our middleware to receive response from the server;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting the router
app.use("/api/v1/" + "auth", authRoutes);
app.use('/api/v1/' + 'data', crudRoutes)
app.use('/api/v1/' + 'pages', page_render_routes)

app.use('/api/v1/pages/image', express.static(resolve(__dirname, "../frontend/src/image")));
app.use(
  "/api/v1/pages/script",
  express.static(resolve(__dirname, "../frontend/src/script"))
);
app.use(
  "/api/v1/pages/styles",
  express.static(resolve(__dirname, "../frontend/src/styles"))
);
app.use("/api/v1/pages/uploads", express.static(resolve(__dirname, './uploads')))



const Server = new io.Server(server, {
  cors:{
    origin: "*"
  }
});




Server.on('connection', async (socket) => {
    console.log('coonection established and stable');

    socket.on('disconnect', () => {
        console.log('connection lost and user disconnected');
    })
})

server.listen(port, () => {
    console.log('Server is running on 4000');
})

// export the Server instance
module.exports = Server;
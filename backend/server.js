/** @format */

const express = require("express");
const app = express();
require("dotenv").config();
const { resolve } = require("path");
require("ejs");

// initialize the db
require("./config/db");

// http server
// const { createServer } = require("http");
// const server = createServer(app);

// socket.io import (FIX)
// const { Server } = require("socket.io");

// routes
const authRoutes = require("./routes/auth.routes");
const crudRoutes = require("./routes/crud.routes");
const page_render_routes = require("./routes/page.render.routes");

// sessions
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);

// port
const port = process.env.PORT || 5000;

// quiz model
const quizCollection = require("./model/quizModel");

// Setting up the ejs template
app.set("view engine", "ejs");
app.set("views", [
  resolve(__dirname, "../frontend/src/template/"),
  resolve(__dirname, "../frontend/src/template/auth"),
  resolve(__dirname, "../frontend/src/template/quizpage"),
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
    store: store,
  })
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/data", crudRoutes);
app.use("/api/v1/pages", page_render_routes);

// static files
app.use(
  "/api/v1/pages/image",
  express.static(resolve(__dirname, "../frontend/src/image"))
);
app.use(
  "/api/v1/pages/script",
  express.static(resolve(__dirname, "../frontend/src/script"))
);
app.use(
  "/api/v1/pages/styles",
  express.static(resolve(__dirname, "../frontend/src/styles"))
);
app.use(
  "/api/v1/pages/uploads",
  express.static(resolve(__dirname, "./uploads"))
);

// // ✅ FIXED SOCKET.IO INITIALIZATION
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// socket events
// io.on("connection", (socket) => {
//   console.log("connection established and stable");

//   socket.on("disconnect", () => {
//     console.log("connection lost and user disconnected");
//   });
// });

// start server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

// export io instance
// module.exports = io;

require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");

const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/users/users");
const db_connection = require("./db/connection");

const { authMiddleware } = require("./middlewares/validation");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/contacts", authMiddleware, contactsRouter);
app.use("/users", usersRouter);

db_connection(process.env.MONGODB_URI, app);

app.use((err, req, res, next) => {
  res.status(400).json({
    status: err.message,
    code: 400,
    message: "Validation Error",
  });
});

app.use((__, res, _) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Not found",
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    code: 500,
    status: "Internal Server Error",
  });
});

module.exports = app;

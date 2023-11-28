require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const validateId = (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    if (!email || !password) {
      return res.json({
        Status: "400 Bad Request",
        ResponseBody: { message: "User must have an email and password" },
      });
    }
  }
  next();
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Not authorized",
      },
    });
  }

  const [bearer, token] = authHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Not authorized",
      },
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
    if (err) {
      return res.status(401).json({
        Status: "401 Unauthorized",
        ResponseBody: {
          message: "Invalid Token",
        },
      });
    }
    req.user = decode;

    next();
  });
};

module.exports = { validateId, validateUser, authMiddleware };

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  validateUser,
  authMiddleware,
} = require("../../middlewares/validation");

const User = require("../../schemas/user");

const usersRouter = express.Router();

usersRouter.post("/register", validateUser, async function (req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        Status: "409 Conflict",
        ResponseBody: { message: "User already registered" },
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      email: email,
      password: passwordHash,
    });
    return res.status(201).json({
      Status: "201 Created",
      ResponseBody: { user: createdUser },
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.post("/login", validateUser, async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      next();
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        Status: "401 Unauthorized",
        ResponseBody: {
          message: "Email or password is wrong",
        },
      });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      Status: "200 OK",
      ResponseBody: {
        token: token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).send({
      Status: "204 No Content",
    });
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/current", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      Status: "200 OK",
      ResponseBody: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (e) {
    return next(e);
  }
});

usersRouter.patch("/", authMiddleware, async (req, res, next) => {
  try {
    if (!req.body.subscription) {
      res.json({
        Status: "400 Bad Request",
        ResponseBody: { message: "Provide New Subscription" },
      });
    }
    if (
      req.body.subscription !== "starter" &&
      req.body.subscription !== "pro" &&
      req.body.subscription !== "business"
    ) {
      res.json({
        Status: "400 Bad Request",
        ResponseBody: {
          message: "Provide Valid Subscription Type (Starter, Pro, Business)",
        },
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    res.json({
      Status: "200 OK",
      ResponseBody: {
        newUser: user,
      },
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = usersRouter;

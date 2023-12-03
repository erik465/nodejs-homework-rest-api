require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const multer = require("multer");
const sendMail = require("../../helpers/email");

const uploadDir = path.join(process.cwd(), "public", "avatars");

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

const {
  validateUser,
  authMiddleware,
} = require("../../middlewares/validation");

const avatarOptions = {
  s: "200",
  r: "pg",
  d: "identicon",
};

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
    const verificationToken = uuidv4();

    await sendMail({
      to: email,
      subject: "Verify Email on Contacts Book",
      html: `To confirm email click on <a href="http://localhost:3000/users/verify/${verificationToken}">link</a>`,
      text: `To confirm go to link localhost:3000/users/verify/${verificationToken}`,
    });

    const createdUser = await User.create({
      email: email,
      password: passwordHash,
      avatarURL: gravatar.url(email, avatarOptions, true),
      verificationToken: verificationToken,
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
    if (!user.verify) {
      return res.json({
        status: "401 Not verified",
      });
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

usersRouter.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res, next) => {
    if (!req.file) {
      res.json({
        Status: "400 Bad Request",
        Message: "Provide an image",
      });
    }

    await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: req.file ? req.file.filename : null },
      { new: true }
    );

    return res.json({
      Status: "200 OK",
      ContentType: "application/json",
      ResponseBody: {
        avatarURL: `localhost:3000/avatars/${req.file.originalname}`,
      },
    });
  }
);

usersRouter.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (user.verify) {
      return res.send({
        Status: "400 Bad Request",
        ResponseBody: {
          message: "User has been already verified",
        },
      });
    }
    await User.findByIdAndUpdate(
      { _id: user.id },
      { verificationToken: null, verify: true },
      { new: true }
    );

    res.send({
      Status: "200 OK",
      ResponseBody: {
        message: "Verification successful",
      },
    });
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/verify", async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "400 Bad Request",
      code: 400,
      message: "Missing required field email",
    });
  }
  const user = await User.findOne({ email });
  if (user.verify) {
    return res.send({
      Status: "400 Bad Request",
      ResponseBody: {
        message: "User has been already verified",
      },
    });
  }

  await sendMail({
    to: email,
    subject: "Verify Email on Contacts Book",
    html: `To confirm email click on <a href="http://localhost:3000/users/verify/${user.verificationToken}">link</a>`,
    text: `To confirm go to link localhost:3000/users/verify/${user.verificationToken}`,
  });
});

module.exports = usersRouter;

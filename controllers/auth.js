const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();

    throw error;
  }

  bcrypt
    .hash(password, 10)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });

      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email);

  let loadeduser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("No user with that email exists");
        error.statusCode = 401;
        throw error;
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((foundUser) => {
      if (!foundUser) {
        const error = new Error("password didn't match");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadeduser.email,
          userId: loadeduser._id.toString(),
        },
        "secretKey",
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token: token, userId: loadeduser._id.toString() });
    })
    .catch((err) => {
      if (!err) {
        error.statusCode = 500;
        throw error;
      }
    });
};

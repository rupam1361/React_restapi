const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/userModel");
const Product = require("../models/productModel");
const checkAuth = require("../middleware/checkAuth");

const mailgun = require("mailgun-js");
const DOMAIN = "MAILGUN_DOMAIN or YOUR_OWN_DOMAIN";
const API_KEY = "YOUR_MAILGUN_API_KEY";
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

let displayImage;

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpg|jpeg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only...");
    }
  },
}).single("myImage");

// Sign Up Route
router.post("/signup", (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((data) => {
      if (data) {
        res.status(500).json({
          message: "User exists.. Please choose a different email..",
        });
      } else {
        if (req.body.password == req.body.confirmPassword) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              res.status(500).json({
                error: err.message,
              });
            }

            const newUser = new User({
              _id: mongoose.Types.ObjectId(),
              username: req.body.username,
              email: req.body.email,
              password: hash,
              userProfileImage: req.body.userProfileImage,
            });

            newUser
              .save()
              .then((data) => {
                res.status(201).json({
                  data: data,
                  message: "Account created successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err.message,
                });
              });
          });
        } else {
          res.status(401).json({
            message: "Password and Confirm Password does not match..",
          });
        }
      }
    });
});

// Login Route
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((data) => {
      if (data) {
        bcrypt.compare(req.body.password, data.password, (err, hash) => {
          if (err) {
            res.status(500).json({
              error: err.messsage,
            });
          } else if (hash) {
            const accessToken = jwt.sign(
              {
                _id: data._id,
                username: data.username,
                email: data.email,
              },
              "secure",
              { expiresIn: "20s" }
            );
            const refreshToken = jwt.sign(
              {
                _id: data._id,
                username: data.username,
                email: data.email,
              },
              "secureRefresh",
              { expiresIn: "7d" }
            );
            console.log(data._id);
            res.status(200).json({
              accessToken: accessToken,
              refreshToken: refreshToken,
              message: "Logged in successfully..",
              _id: data._id,
              email: data.email,
              username: data.username,
            });
          } else {
            res.status(401).json({
              message: "Invalid credentials..",
            });
          }
        });
      } else {
        console.log("No user exists");
        res.status(404).json({ message: "No user found with this email.." });
      }
    });
});

// Forgot password send link Route
router.post("/forgotPassword", (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then(async (data) => {
      if (data) {
        const token = jwt.sign(
          {
            _id: data._id,
            email: data.email,
          },
          "forgotPassword",
          {
            expiresIn: "30m",
          }
        );

        const passwordResetUrl = `https://react-rest-api.herokuapp.com/resetPassword/${token}`;

        const reply = {
          from: "noone@hello.com",
          to: req.body.email,
          subject: "Reset your password for React_rest_api",
          html: `
          <p>We have received a password reset request. The link to reset your password is below. if you did not make this request, you can ignore this mail</p>
          <a href=${passwordResetUrl}>${passwordResetUrl}</a>
        `,
        };

        await User.updateOne(
          { email: req.body.email },
          {
            $set: {
              passwordResetLink: token,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data) {
              mg.messages().send(reply, function (error, body) {
                if (error) {
                  res.status(400).json({
                    message: error.message,
                  });
                }
                res.status(200).json({
                  message:
                    "Email has been sent.. Please follow the instructions..",
                });
              });
            } else {
              res.status(400).json({
                message: "Password resetting error..",
              });
            }
          });
      } else {
        res.status(401).json({
          message: "No user found with this email..",
        });
      }
    });
});

// Password reset or update Route
router.post("/resetPassword", (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.find({ passwordResetLink: req.body.passwordResetLink })
    .exec()
    .then(async (data) => {
      if (data) {
        jwt.verify(
          data[0] ? data[0].passwordResetLink : "1234",
          "forgotPassword",
          (err, decoded) => {
            if (password === confirmPassword) {
              if (err) {
                res.status(401).json({
                  message: "Invalid token or session expired..",
                });
              }
              bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                  res.status(400).json({
                    message: err.message,
                  });
                }
                await User.updateOne(
                  { passwordResetLink: req.body.passwordResetLink },
                  {
                    $set: {
                      password: hash,
                      passwordResetLink: "",
                    },
                  }
                );
              });
              return res.status(200).json({
                message: "You have successfully changed your password..",
              });
            } else {
              res.status(400).json({
                message: "Password and Confirm Password do not match..",
              });
            }
          }
        );
      }
    });
});

// Get Products Route for a user
router.get("/:userId/products", checkAuth, (req, res) => {
  Product.find({ userId: req.params.userId })
    .exec()
    .then((data) => {
      res.status(200).json({
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Get a Single Product Route
router.get("/:userId/products/:productId", checkAuth, (req, res) => {
  Product.find({ userId: req.params.userId } && { _id: req.params.productId })
    .exec()
    .then((data) => {
      res.status(200).json({
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Store images Route
router.post("/uploads", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.json({
        message: err,
      });
    } else {
      if (req.file == undefined) {
        res.json({
          message: "No file selected...",
        });
      } else {
        displayImage = req.file;
        res.status(200).json({
          message: "File uploaded successfully..",
          file: `uploads/${req.file.filename}`,
        });
      }
    }
  });
});

// Add a new Product Route
router.post("/:userId/products", checkAuth, (req, res) => {
  const date = new Date().toString().split(" ");
  const day = date[2];
  const month = date[1];
  const year = date[3];
  const time = date[4];
  const fullTime = `${time}, ${day} ${month}, ${year}`;

  const newProduct = new Product({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    productImage: displayImage.filename,
    createdAt: fullTime,
    userId: req.params.userId,
  });

  newProduct
    .save()
    .then((data) => {
      res.status(201).json({
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });

  res.status(201).json({
    message: "Product added successfully",
    data: newProduct,
  });
});

// Update a Product Route
router.put("/:userId/products/:productId", checkAuth, (req, res) => {
  Product.find({ userId: req.params.userId } && { _id: req.params.productId })
    .exec()
    .then(async (data) => {
      console.log(data[0].productImage);
      if (req.body.productImage != null) {
        console.log("Image available..");
        fs.unlink(`./public/uploads/${data[0].productImage}`, (err) => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        console.log("Image unavailable..");
      }

      console.log(data.name);
      await Product.updateOne(
        {
          _id: new mongoose.Types.ObjectId(req.params.productId),
        },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            productImage:
              req.body.productImage != null
                ? req.body.productImage
                : data[0].productImage,
          },
        }
      );
      res.status(200).json({
        message: "Product updated successfully...",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });

  console.log(displayImage);
});

// Delete a Product Route
router.delete("/:userId/products/:productId", checkAuth, (req, res) => {
  Product.find({ userId: req.params.userId } && { _id: req.params.productId })
    .exec()
    .then((data) => {
      if (data) {
        console.log(data);
        fs.unlink(`./public/uploads/${data[0].productImage}`, (err) => {
          if (err) {
            console.log(err);
          } else {
            Product.deleteOne({ _id: req.params.productId })
              .then((result) => {
                res.status(200).json({
                  message: "Product deleted successfully..",
                  data: result,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err.message,
                });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

// Refresh token Route
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) {
    res.status(401).json({
      error: "No refresh token found",
    });
  }
  jwt.verify(refreshToken, "secureRefresh", (err, user) => {
    if (err) {
      res.status(401).json({
        error: err.message,
      });
    }
    const accessToken = jwt.sign(
      {
        email: user.email,
        username: user.username,
        _id: user._id,
      },
      "secure",
      {
        expiresIn: "30s",
      }
    );
    res.status(200).json({
      accessToken: accessToken,
    });
  });
});

module.exports = router;

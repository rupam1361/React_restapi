const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  userProfileImage: {
    type: String,
  },
  passwordResetLink: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);

const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    const decode = jwt.verify(token, "secure");
    res.userData = decode;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(200).json({
      message: "Authentication failed",
      error: err.message,
    });
  }
};

module.exports = checkAuth;

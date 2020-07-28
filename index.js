const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const userRoutes = require("./api/routes/userRoutes");

const app = express();

// Using MongoDB
mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://<dbusername>:<dbpassword>@cluster0-wcfc1.mongodb.net/<dbname>?retryWrites=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log("Some problem with the connection " + err);
    } else {
      console.log("The Mongoose connection is ready");
    }
  }
);

// Using M-Lab

// mongoose.connect(
//   process.env.MONGODB_URI ||
//     "mongodb://<dbusername>:<dbpassword>@ds053176.mlab.com:53176/react_mern",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   (err) => {
//     if (err) {
//       console.log("Some problem with the connection " + err);
//     } else {
//       console.log("The Mongoose connection is ready");
//     }
//   }
// );

const port = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(express.static("public"));

app.use("/api/v1/users", userRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => console.log(`Server running on port: ${port}`));

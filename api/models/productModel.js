const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  createdAt: {
    type: String,
  },
  productImage: {
    type: String,
  },
  userId: {
    type: String,
  },
});

module.exports = mongoose.model("product", productSchema);

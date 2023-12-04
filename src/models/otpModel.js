const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      index: { expires: 300 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
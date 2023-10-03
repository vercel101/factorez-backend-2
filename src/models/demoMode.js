const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const demoSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true,
      },

      email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },
      phone: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Demo", demoSchema);

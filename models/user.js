const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  key: { type: String, required: true }
}, { timestamps: true });

userSchema.pre("save", async function() {
  if (this.isModified("key")) {
    this.key = await bcrypt.hash(this.key, 10);
  }
})

userSchema.methods.compareKey = async function(key) {
  return await bcrypt.compare(key, this.key);
}

const User = mongoose.model("User", userSchema);

module.exports = User
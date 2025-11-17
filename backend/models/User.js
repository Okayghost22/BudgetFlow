const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  sex: { type: String, enum: ['M','F','O'] },
  salary: { type: Number, default: 0 },
  businessIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  budgets: { type: [Object], default: [] }, // Add this line!
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);

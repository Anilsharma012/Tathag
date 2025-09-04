 const mongoose=require("mongoose")

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Change 'LoginAccounts' to 'User'
        required: true,
      },
    otpCode: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Document will automatically delete after 5 minutes
    },
  });
  
  module.exports = mongoose.model('OTP', otpSchema);
  
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  phone_number: {
    type: String,
  },
  amount: {
    type: Number,
  },
  duration: {
    type: Number,
  },
});

// auto-assigned to the most recent create/update timestamp
paymentSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updatedAt",
});

const Payment = mongoose.model("payments", paymentSchema);

const validatePayment = (postData) => {
  const schema = {
    caption: Joi.string().min(1),
    media: Joi.string().min(1),
  };
  return Joi.object(schema).validate(postData);
};

module.exports.Payment = Payment;
module.exports.validate = validatePayment;

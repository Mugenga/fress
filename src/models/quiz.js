const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const ANSWERS = new mongoose.Schema({
  answer: String,
  is_answer_correct: Boolean,
});

const QUESTIONS = new mongoose.Schema({
  question: String,
  answers: [ANSWERS],
  locked: {type: Boolean, default: true}
});

const quizSchema = new mongoose.Schema({
  quizNumber: Number,
  quizName: {
    type: String,
  },
  questions: [QUESTIONS],
  locked: {type: Boolean, default: true}
});

const quizzes = mongoose.model("quizzes", quizSchema);

const validateQuiz = (postData) => {
  const schema = {
    quizNumber: Joi.number().min(1).required(),
    quizName: Joi.string().min(1).required(),
    locked: Joi.boolean(),
    questions: Joi.array().items(
      Joi.object({
        question: Joi.string().min(1).required(),
        answers: Joi.array().items(
          Joi.object({
            answer: Joi.string().min(1).required(),
            is_answer_correct: Joi.boolean().required(),
          })
        ),
      })
    )
  };
  return Joi.object(schema).validate(postData);
};

module.exports.Quiz = quizzes;
module.exports.validate = validateQuiz;

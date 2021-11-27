const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const COMMENTS = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  comment: String,
});

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  media_url: {
    type: String,
  },
  likes: {
    type: Array,
  },
  comments: [COMMENTS],
});

const posts = mongoose.model("posts", postSchema);

const validatePost = (postData) => {
  const schema = {
    caption: Joi.string().min(1),
    media: Joi.string().min(1),
  };
  return Joi.object(schema).validate(postData);
};

module.exports.Post = posts;
module.exports.validate = validatePost;

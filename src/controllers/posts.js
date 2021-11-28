const base64Img = require("base64-img");
const isJSON = require("is-json");
const router = require("express").Router();

const { asyncMiddleware } = require("../middlewares/async");
const { getLoggedInUserId, getMediaurl } = require("../tools/common");
const { ObjectID } = require("mongodb");
const { Post, validate } = require("../models/post");

const _ = require("lodash");

// Get Single Post
router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const post = await Post.findById(req.params.id);
    post.media_url = getMediaurl(post.media_url);
    return res.status(200).send({
      status: 200,
      post,
      message: "successful",
    });
  })
);

// Update Single Post
router.put(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post) {
      const query = {
        _id: req.params.id,
      };
      Post.findOneAndUpdate(
        query,
        { $set: req.body },
        { new: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
          doc.media_url = getMediaurl(doc.media_url);
          return res.status(200).send({
            status: 200,
            post: doc,
            message: "successful",
          });
        }
      );
    } else {
      res.status(400).json({ message: "Post not found" });
    }
  })
);

// Delete Single Post
router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post) {
      var query = {
        _id: req.params.id,
      };
      Post.deleteOne(query, function (err, doc) {
        if (err) return res.send(500, { error: err });
        return res.status(200).send({
          status: 200,
          message: "successful",
        });
      });
    } else {
      res.status(400).json({ message: "Post not found" });
    }
  })
);

// Create Post
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    //Check if a valid json object is provided
    if (!isJSON(JSON.stringify(req.body)))
      return res
        .status(400)
        .send({ status: 400, errors: ["Investigate your body request."] });

    //validate input  data
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({
        status: 400,
        errors: [error.details[0].message],
      });

    const image = req.body.media;
    if (image) {
      base64Img.img(
        image,
        "./public/posts",
        Date.now(),
        async function (err, filePath) {
          const pathArr = filePath.split("/public");
          const filename = pathArr[pathArr.length - 1];

          req.body.media_url =
            filename.split("\\")[1] + "\\" + filename.split("\\")[2];
          req.body.userId = ObjectID(
            getLoggedInUserId(req.header("x-auth-token"))
          );

          let post = new Post(
            _.pick(req.body, ["caption", "userId", "media_url"])
          );
          post = await post.save();
          post.media_url = getMediaurl(post.media_url);
          return res.status(200).send({
            status: 200,
            post: _.pick(post, [
              "caption",
              "media_url",
              "userId",
              "likes",
              "comments",
            ]),
            message: "successful",
          });
        }
      );
    } else {
      req.body.userId = ObjectID(getLoggedInUserId(req.header("x-auth-token")));

      let post = new Post(_.pick(req.body, ["caption", "userId", "media_url"]));
      post = await post.save();

      return res.status(200).send({
        status: 200,
        post: _.pick(post, ["caption", "userId", "likes", "comments"]),
        message: "successful",
      });
    }
  })
);

// Get All Posts
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    let posts = await Post.find();
    posts.forEach((post) => (post.media_url = getMediaurl(post.media_url)));
    return res.status(200).send({
      status: 200,
      post: posts,
      message: "successful",
    });
  })
);

// Like Post
router.post(
  "/like/:id",
  asyncMiddleware(async (req, res) => {
    const post_id = req.params.id;
    const query = {
      _id: post_id,
    };

    const post = await Post.find({
      _id: post_id,
      likes: ObjectID(getLoggedInUserId(req.header("x-auth-token"))),
    });
    console.log(post);
    if (post.length === 0) {
      Post.findOneAndUpdate(
        query,
        {
          $push: {
            likes: ObjectID(getLoggedInUserId(req.header("x-auth-token"))),
          },
        },
        { new: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
          return res.status(200).send({
            status: 200,
            post: doc,
            message: "successful",
          });
        }
      );
    } else {
      res.status(400).json({ message: "User has already liked the post" });
    }
  })
);

// Comment on Post
router.post(
  "/comment/:id",
  asyncMiddleware(async (req, res) => {
    const post_id = req.params.id;
    const query = {
      _id: post_id,
    };

    const post = await Post.findById(post_id);
    const comment = {
      userId: ObjectID(getLoggedInUserId(req.header("x-auth-token"))),
      comment: req.body.text,
    };

    if (post) {
      Post.findOneAndUpdate(
        query,
        {
          $push: {
            comments: comment,
          },
        },
        { new: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
          return res.status(200).send({
            status: 200,
            post: doc,
            message: "successful",
          });
        }
      );
    } else {
      res.status(400).json({ message: "User has already liked the post" });
    }
  })
);

module.exports = router;

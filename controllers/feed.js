const { validationResult } = require("express-validator");
const Post = require("../models/posts");
const fs = require("fs");
const path = require("path");
const user = require("../models/user");

exports.createPost = async (req, res, next) => {
  //validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  //if req has sent file
  if (!req.file) {
    const error = new Error("No file is chosen");
    error.statusCode = 422;
    throw error;
  }

  try {
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;
    const User = await user.findById(req.userId);

    const post = new Post({
      title: title,
      imageUrl: imageUrl,
      content: content,
      creator: {
        _id: User.id,
        name: User.name,
      },
    });

    let creator;

    const savedPost = await post.save();
    const savedUser = await user.findById(req.userId);
    creator = savedUser;
    savedUser.posts.push(savedPost);
    savedUser.save();

    res.status(201).json({
      message: "post created sucessfully",
      post: post,
      creator: {
        _id: creator._id,
        name: creator.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// post
//   .save()
//   .then((result) => {
//     return user.findById(req.userId);
//   })
//   .then((user) => {
//     creator = user;
//     user.posts.push(post);
//     return user.save();
//   })
//   .then((result) => {
//     res.status(201).json({
//       message: "post created sucessfully",
//       post: post,
//       creator: {
//         _id: creator._id,
//         name: creator.name,
//       },
//     });
// })
// };

exports.getPosts = async (req, res, next) => {
  try {
    const savedUser = await user.findById(req.userId);

    const posts = await Post.find();
    res.status(200).json({
      message: "Posts fetched succesfully",
      posts: posts,
      creator: {
        _id: savedUser._id,
        name: savedUser.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("no post found");
        error.statusCode = 404;
        throw error;
      }
      res.status(201).json({
        message: "Post fetched sucessfully",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image;

  console.log("imageUrl is" + imageUrl);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  if (req.file) {
    imageUrl = req.file.path;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.statusCode = 404;
        throw error;
      }

      if (post.imageUrl !== imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res
        .status(200)
        .json({ message: "post update sucessfully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.statusCode = 404;
        throw error;
      }
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "post deleted sucessfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};

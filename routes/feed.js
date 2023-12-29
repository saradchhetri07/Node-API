const express = require("express");
const feedController = require("../controllers/feed");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

//feed/post
router.post(
  "/createPost",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.createPost
);

//feed
router.get("/getPosts", isAuth, feedController.getPosts);

router.get("/post/:postId", isAuth, feedController.getPost);

//update post
router.put("/post/:postId", isAuth, feedController.updatePost);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;

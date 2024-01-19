const {
  deleteCommentByCommentId,
  patchCommentByCommentId,
} = require("../controllers/comments.controllers");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .delete(deleteCommentByCommentId)
  .patch(patchCommentByCommentId);

module.exports = commentsRouter;

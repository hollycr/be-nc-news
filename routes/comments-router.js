const { deleteCommentByCommentId } = require("../controllers/app.controllers");

const commentsRouter = require("express").Router();

commentsRouter.route("/:comment_id").delete(deleteCommentByCommentId);

module.exports = commentsRouter;

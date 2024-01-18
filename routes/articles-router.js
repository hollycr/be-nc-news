const articlesRouter = require("express").Router();

const {
  getArticles,
  getArticleById,
  patchArticleVotesById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/app.controllers");

articlesRouter.get("/", getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotesById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articlesRouter;

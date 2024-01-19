const articlesRouter = require("express").Router();

const {
  getArticles,
  getArticleById,
  patchArticleVotesByArticleId,
  getCommentsByArticleId,
  postCommentByArticleId,
  postArticle,
} = require("../controllers/articles.controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotesByArticleId);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articlesRouter;

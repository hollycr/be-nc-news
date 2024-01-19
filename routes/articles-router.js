const articlesRouter = require("express").Router();

const {
  getArticles,
  getArticleById,
  patchArticleVotesByArticleId,
  getCommentsByArticleId,
  postCommentByArticleId,
  postArticle,
  deleteArticleByArticleId,
} = require("../controllers/articles.controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotesByArticleId)
  .delete(deleteArticleByArticleId);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articlesRouter;

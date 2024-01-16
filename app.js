const {
  getTopics,
  getEndPoints,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
} = require("./controllers/app.controllers");

const { psqlErrorHandler } = require("./error-handlers");

const express = require("express");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint not found!" });
});

app.use(psqlErrorHandler);

app.use((err, req, res, next) => {
  res.status(err.status).send(err);
});

module.exports = app;

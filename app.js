const {
  getTopics,
  getEndPoints,
  getArticleById,
  getArticles,
} = require("./controllers/app.controllers");

const express = require("express");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint not found!" });
});

app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send(err);
  }
  if (err.code === "22P02") {
    res
      .status(400)
      .send({ msg: "Bad Request: invalid id (must be an integer)" });
  }
});
module.exports = app;

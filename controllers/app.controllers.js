const {
  fetchTopics,
  fetchEndPoints,
  fetchArticleById,
  fetchArticles,
  fetchCommentsById,
  insertComment,
  updateArticleVotesById,
} = require("../models/app.models");

const { checkArticleExists } = require("../utils");

module.exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getEndPoints = (req, res, next) => {
  const endPoints = fetchEndPoints();
  res.status(200).send({ endPoints });
};

module.exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const articleExistsQuery = checkArticleExists(article_id);
  const fetchCommentsQuery = fetchCommentsById(article_id);
  Promise.all([articleExistsQuery, fetchCommentsQuery])
    .then((response) => {
      const comments = response[1];
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postCommentByArticleId = (req, res, next) => {
  const commentToPost = req.body;
  const { article_id } = req.params;
  const articleExistsQuery = checkArticleExists(article_id);
  const insertCommentQuery = insertComment(commentToPost, article_id);
  Promise.all([articleExistsQuery, insertCommentQuery])
    .then((response) => {
      const comment = response[1];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchArticleVotesById = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;

  if (!inc_votes || typeof inc_votes !== "number") {
    res.status(400).send({
      status: 400,
      msg: "Invalid request - must include inc_votes which must have an integer value",
    });
  } else {
    fetchArticleById(article_id)
      .then((currentArticle) => {
        const updatedVoteCount = currentArticle.votes + inc_votes;
        updateArticleVotesById(updatedVoteCount, article_id).then((article) => {
          res.status(200).send({ article });
        });
      })
      .catch((err) => {
        next(err);
      });
  }
};

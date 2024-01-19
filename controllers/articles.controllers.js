const {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleVotesByArticleId,
  insertArticle,
} = require("../models/articles.models");

const {
  checkTopicExists,
  checkArticleExists,
  checkValidIncVotes,
} = require("../utils");

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
  const { topic, sort_by, order } = req.query;
  const getArticlesQuery = fetchArticles(topic, sort_by, order);
  const promiseArr = [getArticlesQuery];
  if (topic) {
    const topicExistsQuery = checkTopicExists(topic);
    promiseArr.push(topicExistsQuery);
  }
  Promise.all(promiseArr)
    .then((response) => {
      const articles = response[0];
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const articleExistsQuery = checkArticleExists(article_id);
  const fetchCommentsQuery = fetchCommentsByArticleId(article_id);
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
  const insertCommentQuery = insertCommentByArticleId(
    commentToPost,
    article_id
  );
  Promise.all([articleExistsQuery, insertCommentQuery])
    .then((response) => {
      const comment = response[1];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchArticleVotesByArticleId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;

  const promiseArr = [fetchArticleById(article_id)];
  if (inc_votes) {
    promiseArr.push(checkValidIncVotes(inc_votes));
  }
  Promise.all(promiseArr)
    .then((response) => {
      let newVoteCount = response[0].votes;
      if (inc_votes) newVoteCount += inc_votes;
      updateArticleVotesByArticleId(newVoteCount, article_id).then(
        (article) => {
          res.status(200).send({ article });
        }
      );
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

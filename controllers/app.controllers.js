const {
  fetchTopics,
  fetchEndPoints,
  fetchArticleById,
  fetchArticles,
  fetchCommentsById,
  insertComment,
  updateArticleVotesById,
  removeCommentByCommentId,
  fetchUsers,
  fetchUserByUsername,
  updateCommentByCommentId,
  fetchCommentByCommentId,
} = require("../models/app.models");

const {
  checkArticleExists,
  checkCommentExists,
  checkTopicExists,
  checkValidIncVotes,
} = require("../utils");

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

  const promiseArr = [fetchArticleById(article_id)];
  if (inc_votes) {
    promiseArr.push(checkValidIncVotes(inc_votes));
  }
  Promise.all(promiseArr)
    .then((response) => {
      let newVoteCount = response[0].votes;
      if (inc_votes) newVoteCount += inc_votes;
      updateArticleVotesById(newVoteCount, article_id).then((article) => {
        res.status(200).send({ article });
      });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  const checkCommentExistsQuery = checkCommentExists(comment_id);
  const removeCommentQuery = removeCommentByCommentId(comment_id);
  Promise.all([removeCommentQuery, checkCommentExistsQuery])
    .then((response) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

module.exports.patchCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  const promiseArr = [
    fetchCommentByCommentId(comment_id),
    checkCommentExists(comment_id),
  ];
  if (inc_votes) {
    promiseArr.push(checkValidIncVotes(inc_votes));
  }
  Promise.all(promiseArr)
    .then((response) => {
      let newVoteCount = Number(response[0].votes);
      if (inc_votes) newVoteCount += inc_votes;
      updateCommentByCommentId(comment_id, newVoteCount).then((comment) => {
        res.status(200).send({ comment });
      });
    })
    .catch(next);
};

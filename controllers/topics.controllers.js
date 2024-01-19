const { fetchTopics, insertTopic } = require("../models/topics.models");

module.exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;
  insertTopic(slug, description)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};

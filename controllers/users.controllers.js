const {
  fetchUsers,
  fetchUserByUsername,
  insertUser,
} = require("../models/users.models");

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

module.exports.postUser = (req, res, next) => {
  const { username, name, avatar_url } = req.body;
  insertUser(username, name, avatar_url)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

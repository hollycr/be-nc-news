const {
  fetchEndPoints,
  removeCommentByCommentId,
  fetchUsers,
  fetchUserByUsername,
  updateCommentByCommentId,
  fetchCommentByCommentId,
} = require("../models/app.models");

module.exports.getEndPoints = (req, res, next) => {
  const endPoints = fetchEndPoints();
  res.status(200).send({ endPoints });
};

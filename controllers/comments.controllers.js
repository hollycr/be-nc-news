const {
  removeCommentByCommentId,
  fetchCommentByCommentId,
  updateCommentByCommentId,
} = require("../models/comments.models");

const { checkCommentExists, checkValidIncVotes } = require("../utils");

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

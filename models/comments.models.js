const db = require("../db/connection");

module.exports.removeCommentByCommentId = (comment_id) => {
  const queryStr = `DELETE FROM comments WHERE comment_id = $1`;
  return db.query(queryStr, [comment_id]);
};

module.exports.fetchCommentByCommentId = (comment_id) => {
  const queryStr = `SELECT * FROM comments WHERE comment_id = $1`;
  return db.query(queryStr, [comment_id]).then(({ rows }) => {
    return rows[0];
  });
};

module.exports.updateCommentByCommentId = (comment_id, newVoteCount) => {
  const queryValues = [newVoteCount, comment_id];
  const queryStr = `UPDATE comments SET votes = $1 WHERE comment_id = $2 RETURNING *`;
  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows[0];
  });
};

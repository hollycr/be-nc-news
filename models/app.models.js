const db = require("../db/connection");

module.exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

module.exports.fetchEndPoints = () => {
  const endpoints = require("../endpoints.json");
  return endpoints;
};

module.exports.fetchArticleById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};

module.exports.fetchArticles = () => {
  const queryStr = `SELECT 
    author, title, article_id, topic, created_at, votes, article_img_url,
    (SELECT COUNT(*)::int FROM comments WHERE comments.article_id = articles.article_id) as comment_count
    FROM articles ORDER BY created_at DESC;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

module.exports.fetchCommentsById = (article_id) => {
  const queryStr = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    return rows;
  });
};

module.exports.insertComment = (commentToPost, article_id) => {
  const queryStr = `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`;
  const values = [commentToPost.username, commentToPost.body, article_id];
  return db.query(queryStr, values).then(({ rows }) => {
    return rows[0];
  });
};

module.exports.updateArticleVotesById = (updatedVoteCount, article_id) => {
  const values = [updatedVoteCount, article_id];
  return db
    .query(
      `UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *`,
      values
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports.removeCommentByCommentId = (comment_id) => {
  const queryStr = `DELETE FROM comments WHERE comment_id = $1`;
  return db.query(queryStr, [comment_id]);
};

module.exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

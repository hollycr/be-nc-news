const db = require("../db/connection");
const { checkTopicExists } = require("../utils");

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
    .query(
      `SELECT *, (SELECT COUNT(*)::int FROM comments WHERE comments.article_id = articles.article_id) as comment_count FROM articles WHERE article_id = $1`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};

module.exports.fetchArticles = (
  topic,
  sort_by = "created_at",
  order = "desc"
) => {
  const greenListSortBys = [
    "created_at",
    "votes",
    "author",
    "title",
    "article_id",
    "topic",
  ];
  if (!greenListSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query!" });
  }
  const queries = [];
  let queryStr = `SELECT 
    author, title, article_id, topic, created_at, votes, article_img_url,
    (SELECT COUNT(*)::int FROM comments WHERE comments.article_id = articles.article_id) as comment_count
    FROM articles`;

  if (topic) {
    queries.push(topic);
    queryStr += ` WHERE topic = $${queries.length}`;
  }

  if (order.toLowerCase() === "asc") {
    queryStr += ` ORDER BY ${sort_by};`;
  } else {
    queryStr += ` ORDER BY ${sort_by} DESC;`;
  }

  return db.query(queryStr, queries).then(({ rows }) => {
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

module.exports.fetchUserByUsername = (username) => {
  const queryStr = `SELECT * FROM users WHERE username = $1`;
  return db.query(queryStr, [username]).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({
        status: 404,
        msg: `${username} does not exist!`,
      });
    return rows[0];
  });
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

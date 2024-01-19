const db = require("../db/connection");
const { values } = require("../db/data/test-data/articles");

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
  order = "desc",
  limit = 10,
  p
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
  let counter = 2;
  let queryStr = `SELECT 
      author, title, article_id, topic, created_at, votes, article_img_url,
      (SELECT COUNT(*)::int FROM comments WHERE comments.article_id = articles.article_id) as comment_count
      FROM articles`;

  if (topic) {
    queries.push(topic);
    queryStr += ` WHERE topic = $${counter - 1}`;
    counter++;
  }

  let offset = 0;
  if (p) offset = (p - 1) * limit;

  queries.push(limit, offset);

  if (order.toLowerCase() === "asc") {
    queryStr += ` ORDER BY ${sort_by} `;
  } else {
    queryStr += ` ORDER BY ${sort_by} DESC`;
  }

  queryStr += ` LIMIT $${counter - 1} OFFSET $${counter};`;

  return db.query(queryStr, queries).then(({ rows }) => {
    return rows;
  });
};

module.exports.fetchTotalNumberOfArticles = (topic) => {
  const queries = [];
  let queryStr = `SELECT * FROM articles`;
  if (topic) {
    queries.push(topic);
    queryStr += ` WHERE topic = $1 ;`;
  }
  return db.query(queryStr, queries).then(({ rows }) => {
    return rows.length;
  });
};

module.exports.fetchCommentsByArticleId = (article_id, limit = 10, p) => {
  let offset = 0;
  if (p) offset = (p - 1) * limit;
  const queryStr = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;`;
  const queries = [article_id, limit, offset];
  return db.query(queryStr, queries).then(({ rows }) => {
    return rows;
  });
};

module.exports.insertCommentByArticleId = (commentToPost, article_id) => {
  const queryStr = `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`;
  const values = [commentToPost.username, commentToPost.body, article_id];
  return db.query(queryStr, values).then(({ rows }) => {
    return rows[0];
  });
};

module.exports.updateArticleVotesByArticleId = (
  updatedVoteCount,
  article_id
) => {
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

module.exports.insertArticle = (
  author,
  title,
  body,
  topic,
  article_img_url
) => {
  if (title.length === 0)
    return Promise.reject({
      status: 400,
      msg: "Title cannot be an empty string",
    });
  if (body.length === 0)
    return Promise.reject({
      status: 400,
      msg: "Article body cannot be an empty string",
    });
  const queryValues = [author, title, body, topic];
  let columnsStr = "author, title, body, topic";
  let valuesStr = "$1, $2, $3, $4";
  if (article_img_url) {
    queryValues.push(article_img_url);
    columnsStr += ", article_img_url";
    valuesStr += ", $5";
  }
  const queryStr = `INSERT INTO articles (${columnsStr}) values (${valuesStr}) RETURNING *, (SELECT COUNT(*)::int FROM comments WHERE comments.article_id = articles.article_id) as comment_count`;
  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows[0];
  });
};

module.exports.removeArticleByArticleId = (article_id) => {
  return db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id]);
};

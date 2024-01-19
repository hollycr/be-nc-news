const db = require("../db/connection");

module.exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

module.exports.insertTopic = (slug, description) => {
  const values = [slug, description];
  if (slug === "")
    return Promise.reject({
      status: 400,
      msg: "Bad Request: slug cannot be an empty string",
    });
  const queryStr = `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;`;
  return db.query(queryStr, values).then(({ rows }) => {
    return rows[0];
  });
};

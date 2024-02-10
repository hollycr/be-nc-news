const db = require("../db/connection");

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

module.exports.insertUser = (username, name, avatar_url) => {
  if (username.length === 0)
    return Promise.reject({
      status: 400,
      msg: "Bad Request: username cannot be an empty string",
    });
  if (name.length === 0)
    return Promise.reject({
      status: 400,
      msg: "Bad Request: name cannot be an empty string",
    });
  const queryValues = [username, name, avatar_url];
  const queryStr = `INSERT INTO users ( username, name, avatar_url) VALUES ($1, $2, $3) RETURNING *`;
  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows[0];
  });
};

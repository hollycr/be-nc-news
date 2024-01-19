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

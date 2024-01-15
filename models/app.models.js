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

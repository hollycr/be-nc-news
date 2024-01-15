const db = require("../db/connection");

module.exports.fetchTopics = () => {
  console.log("made it to the model");
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

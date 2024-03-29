module.exports.psqlErrorHandler = (err, req, res, next) => {
  let msg = err.detail;

  if (err.code === "22P02") {
    if (err.line === "620")
      msg = "Bad Request: invalid id (must be an integer)";
    if (err.line === "882") msg = "Invalid input - must be a positive integer!";

    res.status(400).send({ msg });
  }
  if (err.code === "23502") {
    if (err.table === "comments")
      msg =
        "Invalid comment, couldn't post - make sure you include a body and username";
    if (err.table === "articles")
      msg =
        "Invalid article, couldn't post - must include author, title, body and topic (optional article_img_url)";
    if (err.table === "topics")
      msg = "Invalid topic, couldn't post - must include slug and description";
    res.status(400).send({
      msg,
    });
  }
  if (err.code === "23503") {
    if (err.detail.includes("topic"))
      msg = "Couldn't find that topic in the database.";
    if (err.detail.includes("author"))
      msg = "Username not registered, couldn't post.";
    res.status(404).send({
      msg,
    });
  }
  if (err.code === "23505") {
    if (err.table === "topics") {
      res
        .status(409)
        .send({ status: 409, msg: "Topic already exists in the database!" });
    }
    if (err.table === "users") {
      res
        .status(409)
        .send({ status: 409, msg: "Username already exists in the database!" });
    }
  }
  next(err);
};

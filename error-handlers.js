module.exports.psqlErrorHandler = (err, req, res, next) => {
  let msg = err.detail;
  // msg: "Bad Request: invalid id (must be an integer)"
  if (err.code === "22P02") {
    if (err.line === "620")
      msg = "Bad Request: invalid id (must be an integer)";
    if (err.line === "882")
      msg = "Invalid limit - can only limit by positive integers!";

    res.status(400).send({ msg });
  }
  if (err.code === "23502") {
    if (err.table === "comments")
      msg =
        "Invalid comment, couldn't post - make sure you include a body and username";
    if (err.table === "articles")
      msg =
        "Invalid article, couldn't post - must include author, title, body and topic (optional article_img_url)";
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
  if (err.code === "42703") {
    res
      .status(400)
      .send({
        status: 400,
        msg: "Invalid page number - must be a positive integer!",
      });
  }
  next(err);
};

// code: '42703

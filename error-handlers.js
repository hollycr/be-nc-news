module.exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res
      .status(400)
      .send({ msg: "Bad Request: invalid id (must be an integer)" });
  }
  if (err.code === "23502") {
    // "Invalid comment, couldn't post - make sure you include a body and username"

    let msg = err.detail;
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
    let msg = err.detail;
    if (err.detail.includes("topic"))
      msg = "Couldn't find that topic in the database.";
    if (err.detail.includes("author"))
      msg = "Username not registered, couldn't post.";
    res.status(404).send({
      msg,
    });
  }
  next(err);
};

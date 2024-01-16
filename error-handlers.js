module.exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res
      .status(400)
      .send({ msg: "Bad Request: invalid id (must be an integer)" });
  }
  if (err.code === "23502") {
    res.status(400).send({
      msg: "Invalid comment, couldn't post - make sure you include a body and username",
    });
  }
  if (err.code === "23503") {
    res.status(404).send({
      msg: "Username not registered, couldn't post comment.",
    });
  }
  next(err);
};

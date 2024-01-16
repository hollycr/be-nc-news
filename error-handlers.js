module.exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res
      .status(400)
      .send({ msg: "Bad Request: invalid id (must be an integer)" });
  }
  next(err);
};

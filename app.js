const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const { psqlErrorHandler } = require("./error-handlers");

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint not found!" });
});

app.use(psqlErrorHandler);

app.use((err, req, res, next) => {
  res.status(err.status).send(err);
});

module.exports = app;

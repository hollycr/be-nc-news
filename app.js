const { getTopics, getEndPoints } = require("./controllers/app.controllers");

const express = require("express");

const app = express();

//app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

module.exports = app;

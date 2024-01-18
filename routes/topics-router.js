const topicsRouter = require("express").Router();

const { getTopics } = require("../controllers/app.controllers");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;

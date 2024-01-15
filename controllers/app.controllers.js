const { fetchTopics, fetchEndPoints } = require("../models/app.models");

module.exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
  // .catch((err)=>{
  //     next(err)
  // })
};

module.exports.getEndPoints = (req, res, next) => {
  const endPoints = fetchEndPoints();
  res.status(200).send(endPoints);
};

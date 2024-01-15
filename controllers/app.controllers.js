const { fetchTopics } = require("../models/app.models");

module.exports.getTopics = (req, res, next) => {
  console.log("made it to the controller");
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
  // .catch((err)=>{
  //     next(err)
  // })
};

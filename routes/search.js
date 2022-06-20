const express = require('express');
const router = express.Router();

router.post('/', function (req, res) {
  res.redirect('/pokemon/'.concat(req.body.input));
});

module.exports = router;

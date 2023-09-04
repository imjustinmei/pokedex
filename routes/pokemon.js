const express = require('express');
const router = express.Router();

// '/pokemon' Route
router.get('/:id', (req, res, next) => {
  const input = req.params.id.toLowerCase();
  res.render('pokemon', { pokemon: input });
});

module.exports = router;

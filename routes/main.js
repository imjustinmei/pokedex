const express = require('express');
const router = express.Router();

// '/' Route
router.get('/', (req, res) => {
  res.render('main', { url: 'https://pokeapi.co/api/v2/pokemon?limit=15' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');

// /pokemon Route
router.get('/:id', (req, res, next) => {
  var input = req.params.id.toLowerCase();
  let cached = pokemon.get(input);
  if (!cached) {
    axios
      .get('https://pokeapi.co/api/v2/pokemon/' + input)
      .then((response) => {
        result = response.data;
        object = {
          weight: result.weight,
          height: result.height,
          name: result.name.charAt(0).toUpperCase() + result.name.slice(1),
          id: result.id,
          stats: result.stats.map((item) => {
            return {
              ...item,
              stat: {
                ...item.stat,
                name: item.stat.name.charAt(0).toUpperCase() + item.stat.name.slice(1),
              },
            };
          }),
          sprite: result.sprites.other['official-artwork'].front_default,
          icon: result.sprites['front_default'],
          types: result.types.map((slot) => slot.type.name.charAt(0).toUpperCase() + slot.type.name.slice(1)),
        };
        sucess = pokemon.set(input, object);
        res.render('pokemon', { pokemon: object });
      })
      .catch((err) => {
        if (err.response.data == 'Not Found') {
          res.render('error', {
            status: err.response.status || 404,
            message: 'Pokemon not found' || err.response.statusText,
          });
        } else {
          next();
        }
      });
  } else {
    res.render('pokemon', { pokemon: cached });
  }
});

module.exports = router;

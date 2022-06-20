const express = require('express');
const router = express.Router();
const axios = require('axios');

// / Route
router.get('/', (req, res) => {
  var firstUrl = 'https://pokeapi.co/api/v2/pokemon?limit=15';
  var nextUrl = 'https://pokeapi.co/api/v2/pokemon?offset=15&limit=15';
  let cached = cache.get(firstUrl);
  if (!cached) {
    axios
      .get(firstUrl)
      .then((response) => {
        var urls = response.data.results;
        return Promise.all(
          urls.map((item) => {
            return axios.get(item.url).then((response) => {
              result = response.data;
              object = {
                name: result.name.charAt(0).toUpperCase() + result.name.slice(1),
                id: result.id,
                sprite: result.sprites.other['official-artwork'].front_default,
                types: result.types.map((slot) => slot.type.name.charAt(0).toUpperCase() + slot.type.name.slice(1)),
              };
              return object;
            });
          })
        );
      })
      .then((pokemon) => {
        const success = cache.mset([
          { key: firstUrl, val: pokemon },
          { key: 'next', val: nextUrl },
        ]);
        res.render('main', { pokemon: pokemon });
      });
  } else {
    cache.set('next', nextUrl);
    res.render('main', { pokemon: cached });
  }
});

module.exports = router;

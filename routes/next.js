const express = require('express');
const router = express.Router();
const axios = require('axios');

// /next Route
router.post('/', (req, res) => {
  var nextUrl;
  let current = cache.take('next');
  let value = cache.get(current);
  if (!value) {
    axios
      .get(current)
      .then((response) => {
        var urls = response.data.results;
        nextUrl = response.data.next;
        return Promise.all(
          urls.map((item) => {
            return axios.get(item.url).then((response) => {
              result = response.data;
              object = {
                name:
                  result.name.charAt(0).toUpperCase() + result.name.slice(1),
                id: result.id,
                sprite: result.sprites.other['official-artwork'].front_default,
                types: result.types.map(
                  (slot) =>
                    slot.type.name.charAt(0).toUpperCase() +
                    slot.type.name.slice(1)
                ),
              };
              return object;
            });
          })
        );
      })
      .then((pokemon) => {
        const success = cache.mset([
          { key: current, val: { pokemon: pokemon, next: nextUrl } },
          { key: 'next', val: nextUrl },
        ]);
        res.send({ pokemon: pokemon });
      });
  } else {
    cache.set('next', value.next);
    res.send({ pokemon: value.pokemon });
  }
});

module.exports = router;

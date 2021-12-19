var express = require('express');
const axios = require('axios');
const nodeCache = require('node-cache');
var router = express.Router();

const pokemon = new nodeCache({ stdTTL: 604800, checkperiod: 86400 });

router.get('/pokemon/:id', function (req, res, next) {
  var input = _.lowerCase(req.params.id);
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
                name: _.upperFirst(item.stat.name),
              },
            };
          }),
          sprite: result.sprites.other['official-artwork'].front_default,
          icon: result.sprites['front_default'],
          types: result.types.map(
            (slot) =>
              slot.type.name.charAt(0).toUpperCase() + slot.type.name.slice(1)
          ),
        };
        sucess = pokemon.set(input, object);
        res.render('pokemon', { pokemon: object });
      })
      .catch((err) => {
        next();
      });
  } else {
    console.log('from cache');
    res.render('pokemon', { pokemon: cached });
  }
});

module.exports = router;

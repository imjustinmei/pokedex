const axios = require('axios');
const express = require('express');
const ejs = require('ejs');
const nodeCache = require('node-cache');
const _ = require('lodash');

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const cache = new nodeCache({ stdTTL: 604800, checkperiod: 86400 });
const pokemon = new nodeCache({ stdTTL: 604800, checkperiod: 86400 });

app.get('/', function (req, res) {
  var nextUrl = 'https://pokeapi.co/api/v2/pokemon?offset=15&limit=15';
  var firstUrl = 'https://pokeapi.co/api/v2/pokemon?limit=15';
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

app.post('/next', function (req, res) {
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

app.get('/pokemon/:id', function (req, res, next) {
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
    res.render('pokemon', { pokemon: cached });
  }
});

app.post('/search', function (req, res) {
  var input = req.body.input;
  if (input) {
    res.redirect('/pokemon/'.concat(input));
  }
});

app.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).render('error', {
    error: {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
    },
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('listening on port 3000');
});

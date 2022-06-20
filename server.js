const express = require('express');
const nodeCache = require('node-cache');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

global.cache = new nodeCache({ stdTTL: 604800, checkperiod: 86400 });
global.pokemon = new nodeCache({ stdTTL: 604800, checkperiod: 86400 });

// routes
app.use('/', require('./routes/main'));
app.use('/next', require('./routes/next'));
app.use('/pokemon', require('./routes/pokemon'));
app.use('/search', require('./routes/search'));

// error handling
app.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).render('error', {
    status: error.status || 500,
    message: error.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

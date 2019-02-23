'use strict';
require('dotenv').config();

const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors');
const helmet  = require('helmet');
const MOVIES  = require('./movies');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
  let auth = req.get('Authorization');

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  if (auth.split(' ')[1] !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  
  next();
});

app.get('/movie', (req, res) => {
  let results = [...MOVIES];

  if (req.query.name) {
    results = results.filter((m) => {
      return m.film_title.toLowerCase().includes(req.query.name.toLowerCase());
    });
  }

  if (req.query.country) {
    results = results.filter((m) => {
      return m.country.toLowerCase().includes(req.query.country.toLowerCase());
    });
  }

  if (req.query.genre) {
    results = results.filter((m) => {
      return m.genre.toLowerCase().includes(req.query.genre.toLowerCase());
    });
  }

  if (req.query.avg_vote) {
    results = results.filter((m) => {
      return m.avg_vote >= Number.parseFloat(req.query.avg_vote);
    });
  }

  res.json(results);
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

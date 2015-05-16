var express = require('express');
var request = require('request');
var util = require('util');

var router = express.Router();

const SPARQL_ENDPOINT = 'http://156.35.95.69:3030/ds/query';
var RESTAURANTS_QUERY = '?query=PREFIX : <http://schema.org/>' +
      'SELECT * WHERE {' +
      '?s :name ?name .' +
      '?s :priceRange ?priceRange .' +
      '?s :openingHours ?openingHours .' +
      '?s :photo ?photo .' +
      '?photo :url ?photo_url' +
      ' %s }';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/filter', function(req, res, next) {
  console.log(RESTAURANTS_QUERY);
  var options = {
    url: SPARQL_ENDPOINT + util.format(RESTAURANTS_QUERY, ''),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    }
  }

  request(options, function(error, response, body) {
    if (!error) {
      if (response.statusCode == 200) {
        res.send(body);
      } else {
        res.status(404).json(response)
      }
    } else {
      res.render('503');
    }
  });
});

module.exports = router;

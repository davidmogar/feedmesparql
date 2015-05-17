var express = require('express');
var request = require('request');
var util = require('util');

var router = express.Router();

const SPARQL_ENDPOINT = 'http://156.35.95.69:3030/ds/query';
var RESTAURANTS_QUERY = '?query=PREFIX : <http://schema.org/>' +
      'SELECT ?s ?name ?priceRange ?openingHours ?photo_url ?city WHERE {' +
      '?s :name ?name .' +
      '?s :priceRange ?priceRange .' +
      '?s :openingHours ?openingHours .' +
      '?s :photo ?photo .' +
      '?photo :url ?photo_url .' +
      '?s :address ?address .' +
      '?address :addressLocality ?city' +
      ' %s }';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/filter', function(req, res, next) {
  getRestaurants(req, function(error, response) {
    if (!error) {
      res.render('restaurants', { data: response });
    } else {
      res.render('500');
    }
  });
});

function getRestaurants(req, callback) {
  var options = {
    url: SPARQL_ENDPOINT + util.format(RESTAURANTS_QUERY, createFilters(req)),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    }
  }

  request(options, function(error, response, body) {
    if (!error) {
      if (response.statusCode == 200) {
        callback(false, JSON.parse(body).results.bindings);
      } else {
        callback(true, response)
      }
    } else {
      callback(true);
    }
  });
};

function createFilters(req) {
  var filters = '';
  var name = req.body.name;
  var openingHours = req.body.openingHours;
  var priceRange = req.body.priceRange;

  if (typeof name !== 'undefined')
    filters += 'FILTER (contains(lcase(?name), \'' + name.toLowerCase() + '\') || (contains(lcase(?city),  \'' + name.toLowerCase() + '\')))';
  if (typeof priceRange !== 'undefined')
    filters += 'FILTER (?priceRange = \'' + priceRange + '\')';
  if (typeof openingHours !== 'undefined')
    filters += 'FILTER (' + openingHours.toString().split(',').map(function(obj) { return 'contains(?openingHours, \'' + obj + '\')'; }).join(' || ') + ')';

  return filters;
}

module.exports = router;

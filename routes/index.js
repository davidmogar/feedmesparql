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
var DETAILS_QUERY = '?query=PREFIX : <http://schema.org/>' +
      'PREFIX dc: <http://purl.org/dc/elements/1.1/>' +
      'SELECT ?name ?description ?priceRange ?openingHours ?photo_url ?city ?street ?latitude ?longitude ?email ?telephone WHERE {' +
      '?s dc:identifier %d .' +
      '?s :name ?name .' +
      '?s :description ?description .' +
      '?s :priceRange ?priceRange .' +
      '?s :openingHours ?openingHours .' +
      '?s :photo ?photo .' +
      '?photo :url ?photo_url .' +
      '?s :address ?address .' +
      '?address :addressLocality ?city .' +
      '?address :streetAddress ?street .' +
      '?s :geo ?geo .' +
      '?geo :latitude ?latitude .' +
      '?geo :longitude ?longitude .' +
      '?s :email ?email .' +
      '?s :telephone ?telephone }';
var REVIEWS_QUERY = '?query=PREFIX : <http://schema.org/>' +
      'PREFIX dc: <http://purl.org/dc/elements/1.1/>' +
      'SELECT ?author ?date ?name ?description ?rating WHERE {' +
      '?s dc:identifier %d .' +
      '?s :review ?review .' +
      '?review :author ?author .' +
      '?review :datePublished ?date .' +
      '?review :name ?name .' +
      '?review :description ?description .' +
      '?review :reviewRating ?reviewRating .' +
      '?reviewRating :ratingValue ?rating }';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/restaurants/:id', function(req, res, next) {
  var options = {
    url: SPARQL_ENDPOINT + util.format(DETAILS_QUERY, req.params.id),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    }
  }

  request(options, function(error, response1, body1) {
    if (!error) {
      if (response1.statusCode == 200) {
        options = {
          url: SPARQL_ENDPOINT + util.format(REVIEWS_QUERY, req.params.id),
          headers : {
            'Content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
          }
        }

        request(options, function(error, response2, body2) {
          if (!error) {
            if (response2.statusCode == 200) {
              res.render('restaurant', { data: JSON.parse(body1).results.bindings[0], reviews: JSON.parse(body2).results.bindings });
            } else {
              res.render('500');
            }
          } else {
            res.render('500');
          }
        });
      } else {
        res.render('500');
      }
    } else {
      res.render('500');
    }
  });
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

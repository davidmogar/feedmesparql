var express = require('express');
var request = require('request');
var util = require('util');

var router = express.Router();

const SPARQL_ENDPOINT = 'http://156.35.95.69:3030/ds/update';
var INSERT = '?update=PREFIX : <http://schema.org/>' +
      'PREFIX dc: <http://purl.org/dc/elements/1.1/>' +
      'PREFIX restaurant: <http://156.35.95.69:3000/restaurants/>' +
      'INSERT DATA {' +
      '  restaurant:%d' +
      '  dc:identifier %d ;' +
      '  :name "%s" ;' +
      '  :description "%s" ;' +
      '  :acceptsReservations true ;' +
      '  :priceRange "%s" ;' +
      '  :openingHours "%s" ;' +
      '  :address [' +
      '    :addressLocality "%s" ;' +
      '    :postalCode "%s" ;' +
      '    :streetAddress "%s"' +
      '  ] ;' +
      '  :geo [' +
      '    :latitude %d ;' +
      '    :longitude %d' +
      '  ] ;' +
      '  :email "%s" ;' +
      '  :telephone "%s" ;' +
      '  :photo [' +
      '    :url <%s>' +
      '  ] ; }';
var DELETE = '?update=PREFIX dc: <http://purl.org/dc/elements/1.1/>' +
      'PREFIX restaurant: <http://156.35.95.69:3000/restaurants/>' +
      'DELETE {' +
      '  restaurant:%d ?p ?o' +
      '} WHERE {' +
      '  restaurant:%d ?p ?o }';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('crud');
});

router.post('/insert', function(req, res, next) {
  insertRestaurant(req, function(error, response) {
    if (!error) {
      res.render('success');
    } else {
      res.send(response);
      res.render('500');
    }
  });
});

function insertRestaurant(req, callback) {
  var id = parseInt(req.body.id);
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.priceRange;
  var openingHours = req.body.openingHours;
  var city = req.body.city;
  var code = req.body.code;
  var street = req.body.street;
  var latitude = parseInt(req.body.latitude);
  var longitude = parseInt(req.body.longitude);
  var email = req.body.email;
  var telephone = req.body.telephone;
  var photo = req.body.photo;

  var options = {
    url: SPARQL_ENDPOINT + util.format(INSERT, id, id, name, description, price, openingHours, city, code, street, latitude, longitude, email, telephone, photo),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    },
    method: 'POST'
  }
console.log(options.url);

  request(options, function(error, response, body) {
    if (!error) {
      if (response.statusCode == 200) {
        callback(false, response);
      } else {
        callback(true, response)
      }
    } else {
      callback(true);
    }
  });
};

router.post('/delete', function(req, res, next) {
  var id = parseInt(req.body.id);

  var options = {
    url: SPARQL_ENDPOINT + util.format(DELETE, id, id),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    },
    method: 'POST'
  }

  request(options, function(error, response, body) {
    if (!error) {
      if (response.statusCode == 200) {
        res.render('success');
      } else {
        res.render('500');
      }
    } else {
      res.render('500');
    }
  });
});

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

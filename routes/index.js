var express = require('express');
var request = require('request');
var util = require('util');

var router = express.Router();

const SPARQL_ENDPOINT = 'http://156.35.95.69:3030/ds/query';
var SPARQL_REQUEST = '?query=SELECT * WHERE { %s }';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/filter', function(req, res, next) {
  var query = '?sub ?pred ?obj .';

  var options = {
    url: SPARQL_ENDPOINT + util.format(SPARQL_REQUEST, query),
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

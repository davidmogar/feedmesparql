var express = require('express');
var request = require('request');
var util = require('util');

var router = express.Router();

const SPARQL_ENDPOINT = 'http://156.35.95.69:3030/ds/query';
var MENU_DETAILS_QUERY = '?query=PREFIX : <http://schema.org/>' +
      'PREFIX restmenu: <http://156.35.95.69:3000/menu/>' +
      'SELECT ?position ?name ?image WHERE {' +
      '  restmenu:%d :itemListElement ?list ;' +
      '  :price ?price .' +
      '  ?list ?s ?listitem .' +
      '  ?listitem :item ?item ;' +
      '      :position ?position .' +
      '  ?item :name ?name ;' +
      '        :image ?image }' +
      'ORDER BY ASC(?position)';

router.get('/:id', function(req, res, next) {
  var options = {
    url: SPARQL_ENDPOINT + util.format(MENU_DETAILS_QUERY, req.params.id),
    headers : {
      'Content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    }
  }

  request(options, function(error, response, body) {
    if (!error) {
      if (response.statusCode == 200) {
        res.render('menu', { data: JSON.parse(body).results.bindings });
      } else {
        res.render('500');
      }
    } else {
      res.render('500');
    }
  });
});

module.exports = router;

var unirest = require('unirest');
var express = require('express');
var events = require('events');

var app = express();
app.use(express.static('public'));

var getFromApi = function(endpoint, args) {
	var emitter = new events.EventEmitter();
	console.log("Contacting " + 'https://api.spotify.com/v1/' + endpoint);
	unirest.get('https://api.spotify.com/v1/' + endpoint)
			.qs(args)
			.end(function(response) {
				if (response.ok) {
					emitter.emit('end', response.body);
				}
				else {
					emitter.emit('error', response.code);
				}
			});
	return emitter;
};

var getRelated = function(artist) {
  var emitter = new events.EventEmitter();
  unirest.get('https://api.spotify.com/v1/artists/'+ artist +'/related-artists');
         .end(function(response){
           emitter.emit('end', response.body);
         });
  return emitter;
};

app.get('/search/:name', function(req, res) {
	var searchReq = getFromApi('search', {
		q: req.params.name,
		limit: 1,
		type: 'artist'
	});

	searchReq.on('end', function(item) {
		var artist = item.artists.items[0];
		// var searchRelated = getFromApi('artists/' + artist.id + '/related-artists');
		// var testVar = "";
		/*searchRelated.on('end', function(item) {
			artist.related = item.artists.map(function (v) {
				testVar = v.name;
				return testVar;
			});
			res.json(artist);
		});

		searchRelated.on('error', function(code) {
			res.sendStatus(code);
		}); */
		var relatedArtists = getRelated(artist.id);
    		relatedArtists.on('end', function(item){
     		artist.related = item.artists;
      		res.json(artist);
    	});
	});

	searchReq.on('error', function(code) {
		res.sendStatus(code);
	});

});

app.listen(8080);
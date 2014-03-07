var express = require('express');
var unirest = require('unirest');
var app = express();
 
app.use(express.bodyParser());
 
/*app.get('/endpoint', function(req, res){
	var obj = {};
	obj.title = 'title';
	obj.data = 'data';
	
	console.log('params: ' + JSON.stringify(req.params));
	console.log('body: ' + JSON.stringify(req.body));
	console.log('query: ' + JSON.stringify(req.query));
	
	res.header('Content-type','application/json');
	res.header('Charset','utf8');
	res.send(req.query.callback + '('+ JSON.stringify(obj) + ');');
});*/
 
app.get('/endpoint', function(req, res){

		$.getJSON('https://outdoor-data-api.herokuapp.com/api.json?api_key=bd98d9649939582246b1c171d64073b2&lat='+latlng[0]+'&lon='+latlng[1]+'&radius=25&callback=?', function(data) {
			console.log(data);
  });
// var Request = unirest.get("https://trailapi-trailapi.p.mashape.com/?q[activities_activity_type_name_eq]=hiking&lat=34.1&lon=-105.2&radius=25&q[state_cont]=California&q[country_cont]=Australia&q[city_cont]=Denver&q[activities_activity_name_cont]=Yellow%20River%20Trail&limit=25")
//   .headers({ 
//     "X-Mashape-Authorization": "BkD7JL9FIzJLfzWT2z56HXa2tsjD7ayQ"
//   })
//   .end(function (response) {
//     console.log(response);
// var Request = unirest.get("https://outdoor-data-api.herokuapp.com/api.json?api_key=bd98d9649939582246b1c171d64073b2")
//   .headers({ 
//     "X-Mashape-Authorization": "BkD7JL9FIzJLfzWT2z56HXa2tsjD7ayQ"
//   })
//   .end(function (response) {
//     console.log(response);
//     res.send(response)
//   });
	// var obj = {};
	// console.log('body: ' + JSON.stringify(req.body));
	// res.send('hello world');
});
 
 
app.listen(3000);
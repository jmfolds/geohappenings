dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.addOnLoad(function () {//run after page load
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.pointSymbol = new esri.symbol.SimpleMarkerSymbol();
	this.pointSymbol.setSize(14);
	this.pointSymbol.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1));
	this.pointSymbol.setColor(new dojo.Color([0, 255, 0, 0.25]));
	this.map = new esri.Map('map', {basemap: 'gray', center: [-116.538208, 33.826077], zoom: 10 }); //The first slash of this comment marks 100 characters
	$('.about-modal').on('click',function() { $('#about-modal').modal()});
	$('.search-modal').on('click',function() { $('#search-modal').modal()});
	$('.share-modal').on('click',function() { $('#share-modal').modal()});
	$('.chat-modal').on('click',function() { $('#chat-modal').modal()});
	$('.share-message').on('click',function(evt) { $this.saveMsg(evt) });
	$('#message-input').on('keypress',function(evt) { $this.saveMsg(evt) });
	$('.current-location').on('click',function() { $this.getLocation() });
	$('#add-event-btn').on('click',function() { $this.enableEventClickHandler() });
	$('#search-input').on('typeahead:selected', function (evt, datum, name) {
		$this.map.centerAndZoom(new esri.geometry.Point(datum.lon, datum.lat), 25);
	});
	this.fb.on('value', function (ss) {
		$this.messages = [];
		_.each(ss.val(), function (item) {
			_.each(item.messages, function (item2) {
				$this.messages.push(item2)
			});
		});
		$this.displayChatMessages();
		$this.activateClickListener();//TODO: Need a new place for this
		$this.initTypeahead();
	});
},
saveMsg: function (evt) {
	if (evt.keyCode === 13 || !evt.keyCode) {
		var exists;
		var currentTimeStamp = new Date().getTime(); //get time of day and then display how many minutes its been since last post??
		var name = $('#name-input').val();
		var text = $('#message-input').val();
		if (!name || !text) { $('#alert-modal').modal(); return; }
		if (!this.userLocation || !this.userLocation.lat || !this.userLocation.lon) {
			$('#alert-modal').modal(); return;
		}
		this.fb.on('value', function (ss) {
			exists = (ss.val() !== null)
		});
		if(!exists){ this.fb.child(name).set({text: name}) };
		this.fb.child(name).child('messages').push({ name: name, text: text, lat: this.userLocation.lat, lon: this.userLocation.lon, timeStamp: currentTimeStamp });
		$('#message-input').val('');
	}
},
getLocation: function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(this.onLocationSuccess);
	} else { $('#alert-modal').modal(); }	
},
onLocationSuccess: function(position) {
	this.userLocation = {lat: String(position.coords.latitude), lon: String(position.coords.longitude)};
},
enableEventClickHandler: function() {
	$('#add-event-btn').toggleClass('btn-warning');
    var activate = $('#add-event-btn').hasClass('btn-warning');
    var action = (activate) ? 'enableClickHandler' : 'disableClickHandler';
	if (action === 'enableClickHandler') {
	    this.mapClickHandler = dojo.connect(this.map, 'onClick', dojo.hitch(this, this.onMapClick));
	}
	if (action === 'disableClickHandler') {
        dojo.disconnect(this.mapClickHandler);
		$('#add-event-btn').removeClass('btn-warning');
	}
},
onMapClick: function (evt) {
	var x = esri.geometry.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y, true);
	this.userLocation = { lat: x[1], lon: x[0] };
    dojo.disconnect(this.mapClickHandler);
	$('#add-event-btn').removeClass('btn-warning');
},        
activateClickListener: function() {//new place for this
	var $this = this;
	$('.chat-item').on('click', function(evt) {
		var x = evt.currentTarget.dataset;
		$this.map.centerAndZoom(new esri.geometry.Point(x.lon, x.lat), 25);
	});
},
displayChatMessages: function() {
	var $this = this;
		$('#chat-container').empty();
	_.each(this.messages, function (message) {
		var currentTimeStamp = new Date().getTime();
		timeElapsed =  Math.floor((currentTimeStamp - message.timeStamp) / 1000 / 60); //get time elapsed since the previous messages in firebase
		$('<li class="list-group-item chat-item"></li>').append('<div class="chat-date">' + timeElapsed + ' minutes ago</div><div>'+ message.text + '</div>').attr('data-lat', message.lat).attr('data-lon', message.lon).appendTo($('#chat-container'));
		if (message.lat && message.lon && $this.map.graphics) { //i was getting an error, cannot call add of null, have you seen this?
			var pt = new esri.geometry.Point(message.lon, message.lat);
			$this.map.graphics.add(new esri.Graphic(pt, $this.pointSymbol));
		};
	});
},
initTypeahead: function () {
	$('#search-input').typeahead('destroy');
	var bloodhound = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.text); },
		queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: this.messages
	});
	bloodhound.initialize();
    var options = {	displayKey: 'text',	source: bloodhound.ttAdapter(),
        	templates: { suggestion: _.template('<strong><%=text%></strong>')}};
    $('#search-input').typeahead(null, options);
}
});
new AppView();//spin it up!
});
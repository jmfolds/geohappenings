dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.addOnLoad(function () {//run after page load
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.pointSymbol = new esri.symbol.SimpleMarkerSymbol();
	this.pointSymbol.setColor(new dojo.Color([0, 255, 0, 0.25]));
	this.map = new esri.Map('map', {basemap: 'gray', center: [-116.538208, 33.826077], zoom: 10 });//The first slash of this comment marks 100 characters
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
		$('#search-modal').modal('hide');
	});
	this.fb.on('value', function (ss) {
		$this.messages = [];
		_.each(ss.val(), function (item) {
			_.each(item.messages, function (item2) {
				$this.messages.push(item2)
			});
		});
		$this.displayChatMessages() & $this.activateClickListener() & $this.initTypeahead();//TODO:click listener new home?
	});
},
saveMsg: function (evt) {
	if (evt.keyCode === 13 || !evt.keyCode) {
		var exists;
		var tC = new Date().getTime(); //get time of day and then display how many minutes its been since last post??
		var name = $('#name-input').val();
		var text = $('#message-input').val();
		if (!name || !text) { $('#alert-modal').modal(); return; }
		if (!this.loc || !this.loc.lat || !this.loc.lon) {
			$('#alert-modal').modal(); return;
		}
		this.fb.on('value', function (ss) {	exists = (ss.val() !== null) });
		if(!exists){ this.fb.child(name).set({text: name}) };
		this.fb.child(name).child('messages').push({ name: name, text: text, 
			lat: this.loc.lat, lon: this.loc.lon, timeStamp: tC });
		$('#message-input').val('');
	}
},
getLocation: function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(this.onLocationSuccess);
	} else { $('#alert-modal').modal(); }	
},
onLocationSuccess: function(position) {
	this.loc = {lat: String(position.coords.latitude), lon: String(position.coords.longitude)};
},
enableEventClickHandler: function() {
	$('#add-event-btn').toggleClass('btn-warning');
    var activate = $('#add-event-btn').hasClass('btn-warning');
    var action = (activate) ? 'enableClickHandler' : 'disableClickHandler';
	if (action === 'enableClickHandler') {
	    this.mch = dojo.connect(this.map, 'onClick', dojo.hitch(this, this.onMapClick));
	    $('#share-modal').modal('hide');
	}
	if (action === 'disableClickHandler') {
        dojo.disconnect(this.mch);
		$('#add-event-btn').removeClass('btn-warning');
	}
},
onMapClick: function (evt) {
	var x = esri.geometry.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y, true);
	this.loc = { lat: x[1], lon: x[0] };
    dojo.disconnect(this.mch) & $('#share-modal').modal('show');
	$('#add-event-btn').removeClass('btn-warning');
},        
activateClickListener: function() {//new place for this
	var $this = this;
	$('.chat-item').on('click', function(evt) {
		var x = evt.currentTarget.dataset;
		$this.map.centerAndZoom(new esri.geometry.Point(x.lon, x.lat), 25);
		$('#chat-modal').modal('hide');
	});
},
displayChatMessages: function() {
	var $this = this;
		$('#chat-container').empty();
	_.each(this.messages, function (msg) {
		var tC = new Date().getTime();
		tE =  Math.floor((tC - msg.timeStamp) / 1000 / 60); //get time elapsed since the previous messages in firebase
		$('<li class="list-group-item chat-item"></li>').append('<div class="chat-date">' + tE +
		' minutes ago</div><div>'+ msg.text + '</div>').attr('data-lat', msg.lat).attr('data-lon',
		 msg.lon).appendTo($('#chat-container'));
		if (msg.lat && msg.lon && $this.map.graphics) { //i was getting an error, cannot call add of null, have you seen this?
			var pt = new esri.geometry.Point(msg.lon, msg.lat);
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
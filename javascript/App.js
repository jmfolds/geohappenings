dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.addOnLoad(function () {
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 255, 0, 0.25]));
	this.map = new esri.Map('map', {basemap: 'gray', center: [-116.538208, 33.826077], zoom: 10 });
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
		_.each(ss.val(), function (item) { _.each(item.messages, function (item2) {
				$this.messages.push(item2) });
		});
		$this.displayChatMessages() & $this.activateClickListener() & $this.initTypeahead();
	});
},saveMsg: function (evt) {
	if (evt.keyCode === 13 || !evt.keyCode) { var exists; var tC = new Date().getTime();
		var name = $('#name-input').val(); var text = $('#message-input').val();
		if (!name || !text) { $('#alert-modal').modal(); return; }
		if (!this.loc || !this.loc.lat || !this.loc.lon) {
			$('#no-location-modal').modal(); return; }
		this.fb.on('value', function (ss) {	exists = (ss.val() !== null) });
		if(!exists){ this.fb.child(name).set({text: name}) };
		this.fb.child(name).child('messages').push({ name: name, text: text,
			lat: this.loc.lat, lon: this.loc.lon, timeStamp: tC });
		$('#share-modal').modal('hide'); $('#message-input').val('');
	}
},getLocation: function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(this.onLocationSuccess);
	} else { $('#alert-modal').modal(); }	
},onLocationSuccess: function(position) {
	this.loc = {lat: String(position.coords.latitude), lon: String(position.coords.longitude)};
},enableEventClickHandler: function() {
	$('#add-event-btn').toggleClass('btn-warning');
    var activate = $('#add-event-btn').hasClass('btn-warning');
    var action = (activate) ? 'enableClickHandler' : 'disableClickHandler';
	if (action === 'enableClickHandler') {
	    this.mch = dojo.connect(this.map, 'onClick', dojo.hitch(this, this.onMapClick));
	    $('#share-modal').modal('hide');
	}
	if (action === 'disableClickHandler') { dojo.disconnect(this.mch);
		$('#add-event-btn').removeClass('btn-warning') };
},onMapClick: function (evt) {
	var x = esri.geometry.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y, true);
	this.loc = { lat: x[1], lon: x[0] };
    dojo.disconnect(this.mch) & $('#share-modal').modal('show');
	$('#add-event-btn').removeClass('btn-warning');
},activateClickListener: function() {
	var $this = this;
	$('.chat-item').on('click', function(evt) {
		var d = evt.currentTarget.dataset;
		$this.map.centerAndZoom(new esri.geometry.Point(d.lon, d.lat), 25);
		$('#chat-modal').modal('hide');
	});
},displayChatMessages: function() {
	var $this = this; $('#chat-container').empty();
	this.messages.sort(function (a, b) { if (a.timeStamp > b.timeStamp) { return 1; }
	    if (a.timeStamp < b.timeStamp) { return -1; } return 0;
	});
	_.each(this.messages, function (msg) {
		var tC = new Date().getTime();
		tE =  Math.floor((tC - msg.timeStamp) / 1000 / 60); //get time elapsed since the previous messages in firebase
		$('<li class="list-group-item chat-item"></li>').append('<div class="chat-date">' +
		msg.name +':  '+ tE + ' minutes ago</div><div>'+ msg.text + '</div>')
		.attr('data-lat', msg.lat).attr('data-lon',msg.lon).appendTo($('#chat-container'));
		if (msg.lat && msg.lon && $this.map.graphics) { //i was getting an error, cannot call add of null, have you seen this?
			var pt = new esri.geometry.Point(msg.lon, msg.lat);
			var graphic = new esri.Graphic(pt, $this.symbol);//nv
			$this.map.graphics.add(graphic);//nv
		};
 		var info = new esri.InfoTemplate();//nv
	  	info.setTitle(msg.name + ' ' + tE + ' minutes ago') & info.setContent(msg.text);//nv
	  	graphic.setInfoTemplate(info);//nv
	});
},initTypeahead: function () {
	$('#search-input').typeahead('destroy');
	var bloodhound = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.text); },
		queryTokenizer: Bloodhound.tokenizers.whitespace, local: this.messages });
	bloodhound.initialize();
    var options = {	displayKey: 'text',	source: bloodhound.ttAdapter(),
        	templates: { suggestion: _.template('<strong><%=text%></strong>')}};
    $('#search-input').typeahead(null, options);
}});
new AppView();});
/*
	author 
	(C) HERE 2018
	*/


// check if the site was loaded via secure connection
var secure = (location.protocol === 'https:') ? true : false;

// Define a variable to hold the HARP engine type
const engineType = H.Map.EngineType['HARP'];

// Create a platform object to communicate with the HERE REST APIs
var platform = new H.service.Platform({
	apikey: window.apikey,
	useHTTPS: secure
}),
	maptypes = platform.createDefaultLayers({ engineType }),
	geocoder = platform.getSearchService();

// Instantiate a map in the 'map' div, set the base map to normal
map = new H.Map(document.getElementById('mapContainer'), maptypes.vector.normal.map, {
	engineType,
	center: { lat: 51.50643, lng: -0.12719 },
	zoom: zoom,
});

//add JS API Release information
releaseInfoTxt.innerHTML += "JS API: 3." + H.buildInfo().version;
//add MRS Release information
loadMRSVersionTxt();

var releaseGeocoderShown = false;

// to store the returned locations
var group;

// Enable the map event system
var mapevents = new H.mapevents.MapEvents(map);

// Enable map interaction (pan, zoom, pinch-to-zoom)
var behavior = new H.mapevents.Behavior(mapevents);

// Enable the default UI
var ui = H.ui.UI.createDefault(map, maptypes);

// if the window is resized, we need to resize the viewport
window.addEventListener('resize', function () { map.getViewPort().resize(); });

// handle checks
var mapViewCheck = document.getElementById("useMapview-checkbox");
var countryCheck = document.getElementById("useCountry-checkbox");


mapViewCheck.onchange = function () {
	if (this.checked) {
		countryCheck.checked = false;
	}
};

countryCheck.onchange = function () {
	if (this.checked) {
		mapViewCheck.checked = false;
	}
};







// // register widget for the autocomplete box http://api.jqueryui.com/jQuery.widget/#jQuery-Widget2
// $.widget("custom.autocompleteHighlight", $.ui.autocomplete, {
// 	_renderItem: function (ul, item) {
// 		return $('<li>' + item.label + '</li>').appendTo(ul);
// 	}
// });

// // https://api.jquery.com/jquery.deferred/
// function getReady() {
// 	var deferredReady = $.Deferred();
// 	$(document).ready(function () {
// 		deferredReady.resolve();
// 	});
// 	return deferredReady.promise();
// }

// // url to be used for Autocomplete API calls
// var autoCompelteUrl = 'http://autocomplete.geocoder.api.here.com/6.2/suggest.json';
// if (secure) {
// 	autoCompelteUrl = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json';
// }

// // define the autocomplete component
// $("#search").autocompleteHighlight({
// 	source: function (request, response) {
// 		countries = getSelectedCountries();
// 		var viewBounds = map.screenToLookAtData().bounds.getBoundingBox();

// 		// setting request params for Geocoder Autocomplete API
// 		// https://developer.here.com/documentation/geocoder-autocomplete/topics/resource-suggest.html
// 		geocoderRequest = $.ajax({
// 			url: autoCompelteUrl,
// 			dataType: "json",
// 			data: {
// 				maxresults: 5,
// 				country: countryCheck.checked ? countries : "",
// 				language: document.getElementById("language").value,
// 				query: request.term,
// 				beginHighlight: '<mark>',
// 				endHighlight: '</mark>',
// 				app_id: app_id,
// 				app_code: app_code,
// 				mapview: mapViewCheck.checked ? viewBounds.getTopLeft().lat + "," +
// 					viewBounds.getTopLeft().lng + ";" + viewBounds.getBottomRight().lat +
// 					"," + viewBounds.getBottomRight().lng : ""
// 			}
// 		});

// 		$.when(getReady(), geocoderRequest).done(function (readyResponse, geocoderResponse, placesResponse) {
// 			var g = $.map(geocoderResponse[0].suggestions, function (item) {
// 				var label = item.label.split(',').reverse().join();;
// 				// replace style class used for highlight
// 				value = label.replace(/(<mark>|<\/mark>)/gm, '');
// 				name = label;
// 				return {
// 					label: name,
// 					value: value
// 				}
// 			});

// 			response(g);
// 		});


// 	},
// 	minLength: 2,
// 	select: function (event, ui) {
// 		event.preventDefault();
// 		if (ui.item) {
// 			var selectedString = ui.item.value;
// 			geocode(selectedString, 10);
// 			$("#search").val(selectedString);
// 		}
// 		return true;
// 	},

// });


// Focus on search input.
document.getElementById("search").focus();
const searchInput = document.getElementById('search');
     
// Custom autocomplete functionality
searchInput.addEventListener('input', function () {
	const input = searchInput.value;
	if (input.length < 2) return;

	autocomplete(input);
})

// Prepare the params for search
function getParams(addr, limit) {
	countries = getSelected('chk_c');
	languages = getSelected('language');

	console.log(mapViewCheck.checked);
	console.log(countryCheck.checked);

	// var viewBounds = map.screenToLookAtData(center).bounds.getBoundingBox();
	
	params = {
		q: addr,
		limit: limit,
		lang: languages.length ? languages : "en-US"
	};

	if (mapViewCheck.checked) {
		params.in = `bbox:${mapviewBbox}`;
	} else if (countryCheck & countries.length) {
		params.in = `countryCode:${countries}`;
	} 

	return params;
}


function autocomplete(addr, limit) {

	geocoder.autocomplete(
		getParams(addr, limit),
		onSuccess,
		onError
	);

	function onSuccess(result) {
		// Clear map.
		map.removeObjects(map.getObjects());
		var locations = result.items;

		// Add a marker for each location found
		locations.forEach((location) => {
			// Create and add marker.
			var marker = new H.map.Marker(location.position);
			marker.draggable = true;
			map.addObject(marker);
		});

		// Set result label to search value.
		var label = locations[0].address.label;

		// Update search input.
		document.getElementById("search").value = label;
		// Blur the element to prevent the keyboard from showing up on mobile devices
		document.getElementById("search").blur();

		// Set map view.
		var mapview = new H.geo.Rect(
			locations[0].mapView.north,
			locations[0].mapView.west,
			locations[0].mapView.south,
			locations[0].mapView.east
		);
		map.getViewModel().setLookAtData({ bounds: mapview }, true);
	}

	function onError(error) {
		console.error("Error while geocoding: " + error);
	}
}




// If enter pressed without any selection, 
// geocode the provided text
document.getElementById("search").addEventListener("keypress", function (e) {
	if (e.key === "Enter") {
		document.querySelectorAll(".ui-menu-item").forEach(function (item) {
			item.style.display = "none";
		});
		geocode(document.getElementById("search").value, 10);
	}
});

// get the selected country and languate
mapping = {
	'GBR': 'GBR',
	'BEL': 'BEL',
	'SWE': 'SWE',
	'AUS': 'AWS', 
	'EN': 'en-US',
	'DE': 'de-DE',
	'RU': 'ru-RU',
	'BG': 'bg-BG'
}

function getSelected(options) {
	var items = [];
	const selectElement = document.getElementById(options);
	const selectedOptions = selectElement.selectedOptions;
	for (const option of selectedOptions) {
		items.push(mapping[option.value]);
	};
	return items.join(',');
}


// Gecode the provided text
function geocode(addr, limit) {

	geocoder.geocode(
		getParams(addr, limit),
		onSuccess,
		onError
	);

	// callback when geocoder request is completed
	function onSuccess(result) {
		var position, mapview, bounds;

		if (group) { map.removeObject(group) }
		group = new H.map.Group();

		var locations = result.items;
		// Add a marker for each location found
		locations.forEach((location) => {
			mapview = location.mapView;
			bounds = new H.geo.Rect(mapview.north, mapview.west, mapview.south, mapview.east);

			position = {
				lat: location.position.lat,
				lng: location.position.lng
			};
			marker = new H.map.Marker(position);
			marker.label = location.title;
			group.addObject(marker);
		})
		// Add the locations group to the map
		map.addObject(group);
		// Zoom the map to the location or locations
		if (group.getChildCount() > 1)
			map.getViewModel().setLookAtData({ bounds: group.getBoundingBox() }, true);
		else
			map.getViewModel().setLookAtData({ bounds: bounds }, true);
	}

	function onError(error) {
		alert(`Geocoding search failed for errpr:\n${error}`);
	}
}

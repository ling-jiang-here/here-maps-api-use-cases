/*
		* authors Knut Strobeck
		* (C) HERE 2015
		*
		* This is an example implementation of the route toll cost calculation offered by HERE.
		* With a calculated route the route toll cost calculation service gets called and the
		* response is presented in a summary.
		* Please note that not all possible details of the route toll cost service is analysed
		* by this demo.
		*
		* Cause JS has the limitations of GET request URL length there are several calls done to
		* the route toll cost service. The route (links) gets split in overlapping segments.
		* If they would not overlap you could loose toll informations which are only present between
		* specific segments (links). Since the route toll cost service responds possibly with
		* the same toll on the same links - the result gets post-processed to exclude the double
		* toll costs. This limitation does not exists using POST or GET within other applications.
		// migration by Sachin Jonda
		// (C) HERE 2019 -> migrate to 3.1
		// (C) HERE 2025 -> migrate to HARP
		*/

(function setValuesFromUrl() {
	var indexOf = window.location.href.indexOf('?');
	if (indexOf < 0) return;
	var vars = window.location.href.slice(indexOf + 1).split('&');

	for (var i = 0; i < vars.length; i++) {
		nameVal = vars[i].split('=');
		if (!nameVal[0]) continue;
		document.getElementById(nameVal[0]).value = decodeURIComponent(nameVal[1]);
	}

})();

function cloneSettingsInNewWindow() {
	var url = location.protocol + '//' + location.host + location.pathname + '?';
	var inputs = document.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		url += inputs[i].id + '=' + encodeURIComponent(inputs[i].value) + '&';
	}
	var inputs = document.getElementsByTagName('select');
	for (var i = 0; i < inputs.length; i++) {
		url += inputs[i].id + '=' + inputs[i].value + '&';
	}

	window.open(url);
}

/** 
	update the demo app introduction
*/
var mapReleaseTxt = document.getElementById("mapReleaseTxt");
mapReleaseTxt.innerText = "The cost optimized route optimized upon Toll Cost."
var secondP = mapReleaseTxt.nextElementSibling;
var thirdP = document.createElement('p');
thirdP.innerText = "Click the Calculate Route button and wait for the route to be generated..."
secondP.parentNode.insertBefore(thirdP, secondP.nextSibling);


/** 
	update the Router Parameters form to adapt to Routing API v8
*/

function updateLabel(elementId, newLabel) {
	var elementId = document.getElementById(elementId);
	parentElement = elementId.parentElement;
	predefinedLabel = parentElement.previousElementSibling;
	predefinedLabel.innerHTML = `${newLabel}:`;
}

// update Route Alternatives field
var routeAlternatives = document.getElementById('routeAlternatives');
// Create an array of new options
var newOptions = [
	{ value: '3', text: '3' },
	{ value: '4', text: '4' },
	{ value: '5', text: '5' },
	{ value: '6', text: '6' }
];
// Loop through the array and create an option element for each item
newOptions.forEach(function (optionData) {
	var option = document.createElement('option');
	option.value = optionData.value;
	option.textContent = optionData.text;
	routeAlternatives.appendChild(option);
});

// update the transport types
// update the options of transport type
var predefinedVehSpec = document.getElementById('predefinedVehSpec');
predefinedVehSpec.children[0].value = 'car';
predefinedVehSpec.children[1].value = 'truck';
predefinedVehSpec.children[1].innerHTML = 'Truck';
while (predefinedVehSpec.children.length > 2) {
	predefinedVehSpec.removeChild(predefinedVehSpec.children[2]);
}
// update the label of transport type
// Get the parent element of the select element
updateLabel('predefinedVehSpec', "Transport Type");

// update the routing mode
var routingMode = document.getElementById('vehicles');
parentElement = routingMode.parentElement;
predefinedVehLabel = parentElement.previousElementSibling;
predefinedVehLabel.innerHTML = "Routing Mode:";
routingMode.children[0].textContent = "Fast"
routingMode.children[1].textContent = "Short"
routingMode.children[0].value = "fast"
routingMode.children[1].value = "short"

// update the Axle Count
updateLabel('nrOfAxlesVehicle', "Axle Count");
// update Trailer Axle Count
updateLabel('nrOfAxlesTrailer', "Trailer Axle Count");
// update Trailer Count
updateLabel('trailerNr', "Trailer Count");
// update Tunnel Category
updateLabel('trailerType', "Tunnel Category");
// update Vehicle Width
updateLabel('totalWidth', 'Vehicle Width');
// update Vehicle Length
updateLabel('totalLength', 'Vehicle Length');
// udpate Gross Weight
updateLabel('vehWeight', 'Gross Weight');
// update current weight
updateLabel('totalWeight', 'Current Weight');
// update Allow HOV
updateLabel('hov', 'Allow HOV Lanes');
// update Allow HOT
updateLabel('disabledEquipped', "Allow HOT Lanes");
// update Tiers Count
updateLabel('nrOfTotalTires', "Tires Count");
// update Speed CAP
updateLabel('trailerHeight', "Speed cap (m/s)");
// update Traffic Mode
updateLabel('minPollution', "Traffic Mode");

document.getElementById("routeButton").value = "Calculate Route";
document.getElementById("routeButton").style.backgroundColor = "lightgreen";

// remove original options
while (trailerType.firstChild) {
	trailerType.removeChild(trailerType.firstChild);
}
// update options
newOptions = [
	{ value: 'null', text: 'N/A' },
	{ value: 'B', text: 'B' },
	{ value: 'C', text: 'C' },
	{ value: 'D', text: 'D' },
	{ value: 'E', text: 'E' }
];
newOptions.forEach(function (optionData) {
	var option = document.createElement('option');
	option.value = optionData.value;
	option.textContent = optionData.text;
	trailerType.appendChild(option);
});

// update engine type
updateLabel('hybrid', "Engine Type")
var hybrid = document.getElementById('hybrid');
hybrid.style.width = "140px";
// remove original options
while (hybrid.firstChild) {
	hybrid.removeChild(hybrid.firstChild);
}
// update options
newOptions = [
	{ value: 'null', text: 'N/A' },
	{ value: 'electric', text: 'Electric' },
	{ value: 'pluginHybrid', text: 'PluginHybrid' },
	{ value: 'internalCombustion', text: 'Internal Combustion' }
];
newOptions.forEach(function (optionData) {
	var option = document.createElement('option');
	option.value = optionData.value;
	option.textContent = optionData.text;
	hybrid.appendChild(option);
});

// update Emission Type
var emissionType = document.getElementById('emissionType');
emissionType.style.width = "140px";
// remove the last optioin
emissionType.lastElementChild.remove();
// add more options
var nullOption = document.createElement('option');
nullOption.value = 'null';
nullOption.textContent = 'N/A';
nullOption.selected = true;
emissionType.insertBefore(nullOption, emissionType.firstChild);
emissionType.children[5].selected = false;
// Insert the new option before the first option
newOptions = [
	{ value: 'euro6;co2class=1', text: 'EURO VI CO2 1' },
	{ value: 'euro6;co2class=2', text: 'EURO VI CO2 2' },
	{ value: 'euro6;co2class=3', text: 'EURO VI CO2 3' },
	{ value: 'euro6;co2class=4', text: 'EURO VI CO2 4' },
	{ value: 'euro6;co2class=5', text: 'EURO VI CO2 5' }
];
newOptions.forEach(function (optionData) {
	var option = document.createElement('option');
	option.value = optionData.value;
	option.textContent = optionData.text;
	emissionType.appendChild(option);
});

// update Traffic Mode options
var trafficMode = document.getElementById('minPollution');
trafficMode.children[0].textContent = "Default";
trafficMode.children[1].textContent = "Disabled";


var mapContainer = document.getElementById('mapContainer');

// check if the site was loaded via secure connection
var secure = (location.protocol === 'https:') ? true : false;

platform = new H.service.Platform({
	// apikey: api_key,
	apikey: 'ahWlYm79rXSv2awiESub3BfWSJBHfW_KqzuEK0vE1i0',
	useHTTPS: secure
});
const engineType = H.Map.EngineType['HARP'];
maptypes = platform.createDefaultLayers({ engineType });
// geocoder = platform.getGeocodingService();
geocoder = platform.getSearchService();
router = platform.getRoutingService(null, 8);
group = new H.map.Group();
markerGroup = new H.map.Group();
map = new H.Map(mapContainer, maptypes.vector.normal.map,
	{
		engineType,
		center: center,
		zoom: zoom,
		pixelRatio: window.devicePixelRatio || 1
	}
);

// Do not draw under control panel
map.getViewPort().setPadding(0, 0, 0, $('.ctrl-panel').width());

// add behavior control
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// add UI
var ui = H.ui.UI.createDefault(map, maptypes);

//add JS API Release information
releaseInfoTxt.innerHTML += "JS API: 3." + H.buildInfo().version;

//add MRS Release information
loadMRSVersionTxt();

//helper
var releaseGeocoderShown = false;
var releaseRoutingShown = false;


// add window resizing event listener
window.addEventListener('resize', function () {
	map.getViewPort().resize();
});

// add long click in map event listener
map.addEventListener('longpress', handleLongClickInMap);

var routeButton = document.getElementById("routeButton");
var start = document.getElementById("start");
var dest = document.getElementById("dest");
var mapReleaseTxt = document.getElementById("mapReleaseTxt");

var pointA;
var pointB;
var startMarker = null;
var destMarker = null;
var routeLinkHashMap = new Object(); // key = linkID, value = link object
var routerMapRelease;
var release;
var currentBubble;
var currentOpenBubble;
var bErrorHappened = false;
var bLongClickUseForStartPoint = true; // for long click in map we toggle start/destination

var routeColor = ["rgba(18, 65, 145, 0.8)", "rgba(0, 145, 255, 0.7)", "rgba(127, 201, 255, 0.6)"];
var ppType_A_Color = ["rgba(255, 255, 0, 0.8)", "rgba(255, 255, 0, 0.7)", "rgba(255, 255, 0, 0.6)"];
var ppType_a_Color = ["rgba(255, 216, 0, 0.8)", "rgba(255, 216, 0, 0.7)", "rgba(255, 216, 0, 0.6)"];
var ppType_S_Color = ["rgba(255, 0, 0, 0.8)", "rgba(255, 0, 0, 0.7)", "rgba(255, 0, 0, 0.6)"];
var ppType_p_Color = ["rgba(255, 127, 127, 0.8)", "rgba(255, 127, 127, 0.7)", "rgba(255, 127, 127, 0.6)"];
var ppType_F_Color = ["rgba(214, 127, 255, 0.8)", "rgba(214, 127, 255, 0.7)", "rgba(214, 127, 255, 0.6)"];
var ppType_K_Color = ["rgba(178, 0, 255, 0.8)", "rgba(178, 0, 255, 0.7)", "rgba(178, 0, 255, 0.6)"];
var ppType_U_Color = ["rgba(0, 204, 0, 0.8)", "rgba(0, 204, 0, 0.7)", "rgba(0, 204, 0, 0.6)"];
var tollCostStroke = 8, routeStroke = 8;
var strRoutingRequestSend = "Routing request sent. Waiting for response...";
var strTceRequestSend = "Route Toll Cost request sent and logged. Waiting for response...";
var strTceError = "An Error happened during Route Toll Cost calculation. Please check the vehicle specification<br/>F.e. Trailer number set but no trailer type.";
var strTceResponseReceived = "Received TCE response. Processing it now.";
// toll image
var tollImg = document.createElement("img");
tollImg.src = "/assets/icons/toll_20_10.png";
var tollIcon = new H.map.Icon(tollImg, { anchor: new H.math.Point(0, 10) });
map.addObject(markerGroup);
// enable/disable calculation of cost optimized route calculation
var noCostOptimizationJustCalculate = false;
handleEnableCalculateOptimizedRouteClicked();

// hide the server url input field and lebel as no need for routing 8
var feedbackTxtDiv = document.getElementById('feedbackTxt');
var previousSibling = feedbackTxtDiv.previousElementSibling;
var serverURLTable = previousSibling.previousElementSibling;
serverURLTable.style.display = 'none';


/************************************

Geocoding and routing methods

************************************/

/***/
function clearLastRouteCalculation() {
	bErrorHappened = false;
	bLongClickUseForStartPoint = true;
	if (currentOpenBubble) {
		ui.removeBubble(currentOpenBubble);
	}
	group.removeAll();

}

/************************************
Start Route Calculation
************************************/
var startRouteCalculation = function () {
	clearLastRouteCalculation();
	geocode(start.value, true);
}
routeButton.onclick = startRouteCalculation;

/********************************************************
Start/Destination selectin via LongClick in map
********************************************************/
function handleLongClickInMap(currentEvent) {
	viewportX = currentEvent.currentPointer.viewportX;
	viewportY = currentEvent.currentPointer.viewportY;
	var lastClickedPos = map.screenToGeo(viewportX, viewportY);
	// round up decimal places as Geocoder can only provide upto 7 digits precision after decimal
	lastClickedPos.lat = roundUp(lastClickedPos.lat, 7);
	lastClickedPos.lng = roundUp(lastClickedPos.lng, 7);

	if (bLongClickUseForStartPoint) {
		clearLastRouteCalculation();
		var line1 = "" + lastClickedPos.lat + "," + lastClickedPos.lng;
		//var line2 = " ";
		start.value = line1;
		pointA = new H.geo.Point(lastClickedPos.lat, lastClickedPos.lng);
		if (startMarker != null) {
			markerGroup.removeObject(startMarker);
		}
		startMarker = new H.map.Marker(pointA,
			{
				icon: createIconMarker(line1)
			});
		markerGroup.addObject(startMarker);
		bLongClickUseForStartPoint = false;
	}
	else {
		var line1 = "" + lastClickedPos.lat + "," + lastClickedPos.lng;
		//var line2 = " ";
		dest.value = line1;
		pointB = new H.geo.Point(lastClickedPos.lat, lastClickedPos.lng);
		if (destMarker != null) {
			markerGroup.removeObject(destMarker);
		}
		destMarker = new H.map.Marker(pointB,
			{
				icon: createIconMarker(line1)
			});
		markerGroup.addObject(destMarker);
		bLongClickUseForStartPoint = true;
	}
}

/************************************
Geocode start/destination
************************************/
var isStartGlobal;
var geocode = function (searchTerm, isStart) {
	isStartGlobal = isStart;
	//add Geocoder Release information if not already done
	if (releaseGeocoderShown == false) {
		loadGeocoderVersionTxt();
		releaseGeocoderShown = true;
	}

	// check if coordinates , use search end point for coordinates
	var query = searchTerm.split(",");
	var regex = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*-?(1[0-7]\d(\.\d+)?|180(\.0+)?|[1-9]?\d(\.\d+)?)$/;
	// if (query.length == 2 && regex.test(query[0]) && regex.test(query[1])) {
	if (query.length == 2 && regex.test(searchTerm)) {
		console.log("discover:");
		console.log(searchTerm);
		geocoder.discover(
			{
				at: searchTerm,
				q: searchTerm
			},
			onResult,
			onError
		);
	} else {
		console.log("geocode:");
		console.log(searchTerm);
		geocoder.geocode(
			{
				q: searchTerm
			},
			onResult,
			onError
		);
	}
}
function onError(error) {
	alert(error);
}

function onResult(result) {
	// return if no results
	if (!result.items[0]) {
		onError("Input could not be geocoded");
		return;
	}

	if (result.items[0].position != null) {
		pos = result.items[0].position;
	}
	else {
		onError("Cannot finda the position");
	}

	if (isStartGlobal)
		pointA = new H.geo.Point(pos.lat, pos.lng);
	else
		pointB = new H.geo.Point(pos.lat, pos.lng);

	if (result.items[0].position != null) {
		address = result.items[0].address;
	}
	else {
		onError("Cannot find the address");
	}


	line1 = pos.lat + " " + pos.lng;
	line2 = address.label;

	if (isStartGlobal) {
		if (startMarker != null) {
			markerGroup.removeObject(startMarker);
		}
		startMarker = new H.map.Marker(pointA,
			{
				icon: createIconMarker(line1, line2)
			});
		markerGroup.addObject(startMarker);

	}
	else {
		if (destMarker != null) {
			markerGroup.removeObject(destMarker);
		}
		destMarker = new H.map.Marker(pointB,
			{
				icon: createIconMarker(line1, line2)
			});
		markerGroup.addObject(destMarker);
		map.getViewPort().setPadding(50, 50, 50, $('.ctrl-panel').width() + 50);
		map.getViewModel().setLookAtData({
			bounds: markerGroup.getBoundingBox()
		});
	}

	if (isStartGlobal)
		geocode(dest.value, false);
	else
		calculateRoute(pointA, pointB);

}

/************************************
Actual Route Calculation
************************************/

// // update the hazardousType options
// hazardousType = document.selectElementById('hazardousType');


// var calculateRoute = function (start, destination) {

// 	// generate routing request
// 	var transportMode = "car";
// 	if (vehicles.value == "3" || vehicles.value == "9") {
// 		transportMode = "truck"
// 	}

// 	var hasTrailer = null;
// 	var shippedHazardousGoods = null;
// 	var limitedWeight = null;
// 	var trailerWeight = null;
// 	var height = null;
// 	var width = null;
// 	var length = null;
// 	var heightAbove1stAxle = null;


// 	if (parseInt(trailerType.value) > 0) {
// 		hasTrailer = `&vehicle[trailerCount]=${trailerType.value}`;
// 	}

// 	if (parseInt(hazardousType.value) == 1) {
// 		shippedHazardousGoods = "&vehicle[shippedHazardousGoods]=explosive";
// 	}
// 	else if (parseInt(hazardousType.value) == 2) {
// 		shippedHazardousGoods = "&vehicle[shippedHazardousGoods]=other";
// 	}

// 	if (parseInt(vehWeight.value) > 0) {
// 		if (parseInt(vehWeight.value) > parseInt(totalWeight.value)) {
// 			alert("Total Weight cannot be smaller than Vehicle Weight");
// 			return;
// 		}
// 		limitedWeight = "&vehicle[grossWeight]=" + totalWeight.value;// router 7.2 used by TCE includes trailer weight
// 	}


// 	if (parseInt(vehHeight.value) > 0 || parseInt(trailerHeight.value) > 0) {
// 		height = "&vehicle[height]=" + (parseInt(vehHeight.value) > parseInt(trailerHeight.value) ? parseInt(vehHeight.value) : parseInt(trailerHeight.value));
// 	}

// 	if (parseInt(totalWidth.value) > 0) {
// 		width = "&vehicle[width]=" + totalWidth.value;
// 	}

// 	if (parseInt(totalLength.value) > 0) {
// 		length = "&vehicle[length]=" + totalLength.value;
// 	}

// 	// if (document.getElementById("heightAbove1stAxle").value != 0) {
// 	// 	heightAbove1stAxle = (document.getElementById("heightAbove1stAxle").value / 100) + "m";
// 	// }

// 	var vspec = "";
// 	vspec += "&tollVehicleType=" + vehicles.value;
// 	vspec += "&trailerType=" + trailerType.value;
// 	vspec += "&trailersCount=" + trailerNr.value;
// 	vspec += "&vehicleNumberAxles=" + nrOfAxlesVehicle.value;
// 	vspec += "&trailerNumberAxles=" + nrOfAxlesTrailer.value;
// 	vspec += "&hybrid=" + hybrid.value;
// 	vspec += "&emissionType=" + emissionType.value;
// 	vspec += "&fuelType=" + fuelType.value;
// 	if (height != null && height.length > 0) vspec += height;
// 	vspec += "&trailerHeight=" + trailerHeight.value;
// 	vspec += "&vehicle[currentWeight]=" + vehWeight.value;
// 	if (limitedWeight != null && limitedWeight.length > 0) vspec += limitedWeight;
// 	vspec += "&disabledEquipped=" + disabledEquipped.value;
// 	vspec += "&minimalPollution=" + minPollution.value;
// 	vspec += "&hov=" + hov.value;
// 	vspec += "&passengersCount=" + nrPassengers.value;
// 	vspec += "&tiresCount=" + nrOfTotalTires.value;
// 	vspec += "&commercial=" + commercial.value;
// 	vspec += "&heightAbove1stAxle=" + heightAbove1stAxle;
// 	if (width != null && width.length > 0) vspec += width;
// 	if (length != null && length.length > 0) vspec += length;
// 	if (shippedHazardousGoods != null && shippedHazardousGoods.length > 0) vspec += shippedHazardousGoods;
// 	var routerParamsValue = document.getElementById('routerParamsValue').value;
// 	var finalParamsValue = '';
// 	if (routerParamsValue !== '') {
// 		var paramsArray = [];
// 		var components = routerParamsValue.split('&');
// 		for (var i = 0; i < components.length; i++) {
// 			var key = components[i].split('=');
// 			if (key[0].substr(0, 'origin'.length) === 'origin' ||
// 				key[0].substr(0, 'destination'.length) === 'destination' ||
// 				key[0] === 'mode') {
// 				continue;// Ignore what we had specified
// 			}
// 			paramsArray.push(components[i]);
// 		}
// 		finalParamsValue = paramsArray.join('&');
// 	}

// 	var isDTFilteringEnabled = document.getElementById("chkEnableDTFiltering").checked;

// 	var urlRoutingReq =
// 		[
// 			serverURL.value,
// 			"jsonAttributes=41",
// 			"&origion=",
// 			start.lat,
// 			",",
// 			start.lng,
// 			"&detail=1",
// 			"&destination=",
// 			destination.lat,
// 			",",
// 			destination.lng,
// 			"&maneuverAttributes=none",
// 			"&linkAttributes=none,sh",
// 			"&legAttributes=none,li",
// 			(noCostOptimizationJustCalculate ? "" : "&driver_cost="),
// 			(noCostOptimizationJustCalculate ? "" : document.getElementById('hourDriverCost').value),
// 			(noCostOptimizationJustCalculate ? "" : "&vehicle_cost="),
// 			(noCostOptimizationJustCalculate ? "" : document.getElementById('hourVehicleCost').value),
// 			"&currency=",
// 			document.getElementById('currency').value,
// 			"&departureTime=",
// 			isDTFilteringEnabled ? document.getElementById("startRouteDate").value + 'T' + document.getElementById("startRouteTime").value : 'any',
// 			vspec,
// 			"&mode=fastest",
// 			"&transportMode=", transportMode,
// 			"&rollup=none,country;tollsys",
// 			"&apiKey=",
// 			api_key,
// 			// Additional custom parameters
// 			(finalParamsValue !== '' ? '&' + finalParamsValue : ''),
// 			"&jsoncallback=parseRoutingResponse"].join("");
// 	feedbackTxt.innerHTML = strRoutingRequestSend;
// 	script = document.createElement("script");
// 	script.src = urlRoutingReq;
// 	document.body.appendChild(script);
// }

routeAlternatives = document.getElementById("routeAlternatives").value;


var calculateRoute = function (start, destination) {
	router.calculateRoute({
		'origin': `${start.lat},${start.lng}`,
		'destination': `${destination.lat},${destination.lng}`,
		'alternatives': routeAlternatives,
		'return': 'polyline',
		'transportMode': 'car'
	}, (result) => {
		const sections = result.routes[0].sections;
		const lineStrings = [];
		sections.forEach((section) => {
			// convert Flexible Polyline encoded string to geometry
			lineStrings.push(H.geo.LineString.fromFlexiblePolyline(section.polyline));
		});
		const multiLineString = new H.geo.MultiLineString(lineStrings);
		const bounds = multiLineString.getBoundingBox();
		// render route on the map
		map.addObject(new H.map.Polyline(multiLineString, { style: { lineWidth: 5 } }));
		// zoom to polyline
		map.getViewPort().setPadding(50, 50, 50, $('.ctrl-panel').width() + 50);
		map.getViewModel().setLookAtData({ bounds });
	}, console.error);
}

/************************************
parse the routing response
************************************/
function parseRoutingResponse(resp) {
	if (resp.error != undefined) {
		if (resp.error == "NoRouteFound") {
			alert('Please consider to change your start or destination as the one you entered is not reachable with the given vehicle profile');
			feedbackTxt.innerHTML = 'The Router service is unable to compute the route: try to change your start / destination point';
		}
		else {
			alert(resp.error);
			feedbackTxt.innerHTML = resp.error;
		}
		return;
	}
	if (resp.response == undefined && resp.subtype != undefined) {
		if (resp.subtype == "NoRouteFound") {
			alert('Please consider to change your start or destination as the one you entered is not reachable with the given vehicle profile');
			feedbackTxt.innerHTML = 'The Router service is unable to compute the route: try to change your start / destination point';
		}
		else {
			alert(resp.subtype + " " + resp.details);
			feedbackTxt.innerHTML = resp.error;
		}
		return;
	}
	if (resp.error != undefined) {
		feedbackTxt.innerHTML = resp.error;
		return;
	}
	if (resp.responseCode != undefined) {
		alert(resp.message);
		feedbackTxt.innerHTML = resp.message;
		return;
	}
	if (resp.onError == true) {
		for (var i = 0; i < resp.errors.length; i++) {
			feedbackTxt.innerHTML = "<font color='red'>" + resp.errors + "</font>";
			feedbackTxt.innerHTML += "<br />";
		}
		return;
	}
	if (bErrorHappened) {
		return;
	}

	if (feedbackTxt.innerHTML != strTceError) {
		feedbackTxt.innerHTML = strTceResponseReceived;
	}

	routeLinkHashMap = new Object();

	// create link objects
	for (var r = 0; r < resp.response.route.length; r++) {
		for (var m = 0; m < resp.response.route[r].leg[0].link.length; m++) {
			// only add new link if it does not exist so far - so alternatives are not drawn multiple times
			var linkId = (resp.response.route[r].leg[0].link[m].linkId.lastIndexOf("+", 0) === 0 ? resp.response.route[r].leg[0].link[m].linkId.substring(1) : resp.response.route[r].leg[0].link[m].linkId);
			if (routeLinkHashMap[linkId] == null) {
				var strip = new H.geo.LineString(),
					shape = resp.response.route[r].leg[0].link[m].shape,
					i,
					l = shape.length;

				for (i = 0; i < l; i += 2) {
					strip.pushLatLngAlt(shape[i], shape[i + 1], 0);
				}

				var link = new H.map.Polyline(strip,
					{
						style: {
							lineWidth: (routeStroke - (r + 1)), // alternatives get smaller line with
							strokeColor: routeColor[r],
							lineCap: 'butt'
						}
					});
				link.setArrows({ color: "#F00F", width: 2, length: 3, frequency: 4 });
				link.$linkId = resp.response.route[r].leg[0].link[m].linkId;

				//The router can send back links ids with "-" or "+" prefix: only "-" prefix is kept and stored in this HashMap, the "+" is removed
				routeLinkHashMap[linkId] = link;

				// add event listener to link
				link.addEventListener("pointerdown", function (e) {
					if (currentOpenBubble)
						ui.removeBubble(currentOpenBubble);
					var html = '<div>' +
						'<p style="font-family:Arial,sans-serif; font-size:12px;">LinkId: ' + e.target.$linkId + '</p>'
					'</div>';

					var pos = map.screenToGeo(e.currentPointer.viewportX, e.currentPointer.viewportY);

					currentOpenBubble = new H.ui.InfoBubble(pos, { content: html });
					ui.addBubble(currentOpenBubble);
				});

				group.addObject(link);
			}
		}
	}

	map.addObject(group);

	// show TCE costs
	showTceCost(resp.response.route[0].tollCost.costsByCountryAndTollSystem, resp.response.route[0].cost, resp.response.route[0].summary.distance / 1000.0, resp.response.route[0].summary.baseTime / 60 / 60.00, resp.response.route[0].summary.trafficTime / 60 / 60.00);

	/***********************************************
	Highlight Links
	***********************************************/
	for (var i = 0; i < resp.response.route.length; i++) {
		highlightRoute(resp.response.route[i].tollCost.routeTollItems, i);
	}
}

/**************************************************
show route toll cost response
**************************************************/
function showTceCost(costByCountryAndTollSystem, costs, length, basetime, traffictime) {

	/***********************************************

	Publishing route total cost

	***********************************************/

	feedbackTxt.innerHTML = "<br/><span style=\"font-weight: bold;border: 1px solid;padding: 2px;\">COSTS FOR MAIN ROUTE</span>";
	if (!costs) {
		feedbackTxt.innerHTML += "<br/><br/>None.";
	} else {
		feedbackTxt.innerHTML += "<br/><br/>Length: " + length + " km<br/>";
		feedbackTxt.innerHTML += "BaseTime: " + basetime + " h<br/>";
		feedbackTxt.innerHTML += "TrafficTime: " + traffictime + " h<br/>";

		feedbackTxt.innerHTML += "Total Cost: " + costs.totalCost + " " + costs.currency + "<br/>";
		feedbackTxt.innerHTML += "Driver Cost: " + costs.details.driverCost + " " + costs.currency + "<br/>";
		feedbackTxt.innerHTML += "Vehicle Cost: " + costs.details.vehicleCost + " " + costs.currency + "<br/>";
		feedbackTxt.innerHTML += "Toll Cost: " + costs.details.tollCost + " " + costs.currency + "<br/>";
	}


	/***********************************************

	Publishing route detail cost

	***********************************************/

	feedbackTxt.innerHTML += "<br/><span style=\"font-weight: bold;border: 1px solid;padding: 2px;\">TOLL COST FOR MAIN ROUTE</span>";

	if (costs.details.tollCost == 0.0) {
		feedbackTxt.innerHTML += "<br/><br/>None.<br/><br/>";
	}

	/***********************************************
	Apply toll to link objects
	***********************************************/
	if (costByCountryAndTollSystem != null) {
		var feedback = "";
		feedback += "<br/>";
		for (var j = 0; j < costByCountryAndTollSystem.length; j++) {
			feedback += "<br/><span style=\"font-weight: bold;border: 1px solid;padding: 2px;\">" + costByCountryAndTollSystem[j].country + "</span>"
			feedback += "<ul><li>";
			if (costByCountryAndTollSystem[j].name != null && costByCountryAndTollSystem[j].name.trim().length > 0) {
				feedback += "Toll System " + costByCountryAndTollSystem[j].name + ": ";
			} else if (costByCountryAndTollSystem[j].tollSystemId != null && costByCountryAndTollSystem[j].tollSystemId.trim().length > 0) {
				feedback += "Toll System ID " + costByCountryAndTollSystem[j].tollSystemId + ": "
			} else {
				feedback += "Toll : ";
			}
			feedback += costByCountryAndTollSystem[j].amountInTargetCurrency + " " + costs.currency;
			feedback += "</li></ul>";
		}

		feedbackTxt.innerHTML += feedback;
	}

	if (costs.details.tollCost != 0.0) {
		feedbackTxt.innerHTML += "<br/><br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_A_Color[0]) + ";\">Paypoint Type A: Country wide toll - payed here.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_a_Color[0]) + ";\">Paypoint Type A: Country wide toll - payed somewhere else.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_S_Color[0]) + ";\">Paypoint Type S: Toll section from one toll booth or between two toll boths.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_p_Color[0]) + ";\">Paypoint Type p: Toll - payed somewhere else.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_F_Color[0]) + ";\">Paypoint Type F: Toll section belonging to a toll system.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_K_Color[0]) + ";\">Paypoint Type K: Toll section defined between junctions.</span>";
		feedbackTxt.innerHTML += "<br/><span style=\"font-weight: normal;color:" + rgb2hex(ppType_U_Color[0]) + ";\">UFR: Usage fee required link(s).</span>";
	}

	return; // done

}

/**
	Highlights the toll links in map display
*/
function highlightRoute(routeTollItems, routeAlternative) {
	if (routeTollItems != null) {
		for (var i = 0; i < routeTollItems.length; i++) {
			var tollType = routeTollItems[i].tollType;
			var color = ppType_S_Color[routeAlternative];
			if (tollType == 'A') {
				color = ppType_A_Color[routeAlternative];
			} else if (tollType == 'a') {
				color = ppType_a_Color[routeAlternative];
			} else if (tollType == 'S') {
				color = ppType_S_Color[routeAlternative];
			} else if (tollType == 'p') {
				color = ppType_p_Color[routeAlternative];
			} else if (tollType == 'F') {
				color = ppType_F_Color[routeAlternative];
			} else if (tollType == 'K') {
				color = ppType_K_Color[routeAlternative];
			} else if (tollType == 'U') {
				color = ppType_U_Color[routeAlternative];
			}

			for (var j = 0; j < routeTollItems[i].linkIds.length; j++) {
				// set color and stroke of links
				var tollstroke = (tollCostStroke - (routeAlternative + 1));	// route alternatives have a different stroke
				var link = routeLinkHashMap[routeTollItems[i].linkIds[j]];
				if (link.getStyle().strokeColor == routeColor[routeAlternative]) { // only change link color to toll color if not already modified
					link.setStyle({ strokeColor: color, lineWidth: tollstroke });
				}
			}

			//toll structures
			if (routeTollItems[i].tollStructures != null) {
				for (var j = 0; j < routeTollItems[i].tollStructures.length; j++) {
					createTollMarker(routeTollItems[i].tollStructures[j]);
				}
			}
		}
	}

}

//--- Helper - Create Start / Destination marker
var createIconMarker = function (line1, line2) {
	var svgMarker = svgMarkerImage_Line;

	// every long address not shown 
	// correctly in marker
	if (line2 && line2.length > 42) {
		line2 = line2.substring(0, 40);
		line2 = line2 + "..";
	}

	svgMarker = svgMarker.replace(/__line1__/g, line1);
	svgMarker = svgMarker.replace(/__line2__/g, (line2 != undefined ? line2 : ""));
	svgMarker = svgMarker.replace(/__width__/g, (line2 != undefined ? line2.length * 4 + 20 : (line1.length * 4 + 80)));
	svgMarker = svgMarker.replace(/__widthAll__/g, (line2 != undefined ? line2.length * 4 + 80 : (line1.length * 4 + 150)));
	var icon = new H.map.Icon(svgMarker, {
		anchor: new H.math.Point(24, 57)
	});
	return icon;

};


// Helper for selecting the value attached to a JS selection
function selectionSettingHelper(selection, value) {
	for (var opt, j = 0; opt = selection.options[j]; j++) {
		if (opt.value == value) {
			selection.selectedIndex = j;
			break;
		}
	}
}

/*********************************
 Vehicle Specification
 *********************************/
/**
 This method checks the user setted vehicle specification and adapts all vehicle value in the GUI
 */
function handleVehicleSpecChanged() {
	setUserdefinedVehicleSpec(false);
	var vehicle = 2;
	var totalNumTires = 4;
	var trailerType = 0;
	var trailerNum = 0;
	var vehicleNumAxles = 2;
	var trailerNumAxles = 0;
	var hybrid = 0;
	var emmisionType = 5;
	var vehicleHeight = 167;
	var vehicleWeight = 1739;
	var trailerHeight = 0;
	var totalWeight = 1739;
	var totalWidth = 180;
	var totalLength = 441;
	var disabledEquipped = 0;
	var minPollution = 0;
	var hov = 0;
	var numPassengers = 2;
	var commercial = 0;
	var hazardousType = 0;
	var heightAbove1stAxle = 100;
	var fuelType = 'petrol';

	var vehSpecSelection = document.getElementById("predefinedVehSpec");
	if (vehSpecSelection.value == 0) // Car

	else if (vehSpecSelection.value == 1) // Transporter



	selectionSettingHelper(document.getElementById("vehicles"), vehicle);
	document.getElementById("nrOfTotalTires").value = totalNumTires;
	selectionSettingHelper(document.getElementById("trailerType"), trailerType);
	selectionSettingHelper(document.getElementById("trailerNr"), trailerNum);
	document.getElementById("nrOfAxlesVehicle").value = vehicleNumAxles;
	document.getElementById("nrOfAxlesTrailer").value = trailerNumAxles;
	selectionSettingHelper(document.getElementById("hybrid"), hybrid);
	selectionSettingHelper(document.getElementById("emissionType"), emmisionType);
	document.getElementById("vehHeight").value = vehicleHeight;
	document.getElementById("vehWeight").value = vehicleWeight;
	document.getElementById("trailerHeight").value = trailerHeight;
	document.getElementById("totalWeight").value = totalWeight;
	document.getElementById("totalWidth").value = totalWidth;
	document.getElementById("totalLength").value = totalLength;
	selectionSettingHelper(document.getElementById("disabledEquipped"), disabledEquipped);
	selectionSettingHelper(document.getElementById("minPollution"), minPollution);
	selectionSettingHelper(document.getElementById("hov"), hov);
	document.getElementById("nrPassengers").value = numPassengers;
	selectionSettingHelper(document.getElementById("commercial"), commercial);
	selectionSettingHelper(document.getElementById("hazardousType"), hazardousType);
	document.getElementById("heightAbove1stAxle").value = heightAbove1stAxle;
	selectionSettingHelper(document.getElementById("fuelType"), fuelType);
}

/**
 This method sets the user defined vehicle spec option in the element predefinedVehSpec if
 the passed parameter is true
 */
function setUserdefinedVehicleSpec(bSetUserdefinedVehicleSpec) {
	if (bSetUserdefinedVehicleSpec) {
		// show User defined option
		var vehSpecSelection = document.getElementById("predefinedVehSpec");
		selectionSettingHelper(vehSpecSelection, 99);
	}
	/*else
	 {
	 // do nothing cause User defined option will hide automatically
	 }*/
}


/**
This method creates the toll marker at the beginning of the passed link
*/
function createTollMarker(oneTollStructure) {
	var pos = new H.geo.Point(oneTollStructure.latitude, oneTollStructure.longitude);
	var tollMarker = new H.map.Marker(pos, { icon: tollIcon });
	tollMarker.addEventListener("tap", function () { displayTollStructureName(pos, oneTollStructure.name); });
	group.addObject(tollMarker);
}

function displayTollStructureName(position, name) {
	infoBubble = new H.ui.InfoBubble(position, { content: name });
	ui.addBubble(infoBubble);
}

//Function to convert hex format to a rgb color from http://jsfiddle.net/Mottie/xcqpF/1/light/
function rgb2hex(rgb) {
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

// Check if a string is null/undefined/withoutContent
function isEmpty(str) {
	return (!str || 0 === str.length);
}


/**
 * Function handling the click on the "Enable datetime filtering" checkbox
 */
function handleDateTimeFilteringClicked() {
	var isDTFilteringEnabled = document.getElementById("chkEnableDTFiltering").checked;
	if (isDTFilteringEnabled) {
		//Displaying the date and time input checkboxes
		document.getElementById("trStartRouteDate").style.display = '';
		document.getElementById("trStartRouteTime").style.display = '';
		document.getElementById("trStartRouteActions").style.display = '';
	}
	else {
		//Hiding the date and time input checkboxes
		document.getElementById("trStartRouteDate").style.display = 'none';
		document.getElementById("trStartRouteTime").style.display = 'none';
		document.getElementById("trStartRouteActions").style.display = 'none';
	}

}


/**
	Function handling the click on the "enable/disable cost optimized routing calculation" checkbox
*/
function handleEnableCalculateOptimizedRouteClicked() {
	noCostOptimizationJustCalculate = 
		document.getElementById("chkEnableCalculateOptimizedRoute").checked ? false : true;
}



function applyNowToStartRoute() {

	//Getting now datetime informations
	var now = new Date();
	var day = now.getDate();
	var month = now.getMonth() + 1; //January is 0!
	var year = now.getFullYear();
	var hours = now.getHours()
	var minutes = now.getMinutes()
	var seconds = now.getSeconds()

	//Setting these info in the datetime fields
	document.getElementById("startRouteDate").value = year + '-' + ((month < 10) ? '0' + month : month) + '-' + ((day < 10) ? '0' + day : day);
	document.getElementById("startRouteTime").value = ((hours < 10) ? '0' + hours : hours) + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
}
// Function rounds up number of decimal places
function roundUp(num, places) {
	return +(Math.round(num + "e+" + places) + "e-" + places);
}
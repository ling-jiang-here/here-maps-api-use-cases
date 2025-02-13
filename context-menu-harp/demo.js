// check if the site was loaded via secure connection
var secure = (location.protocol === 'https:') ? true : false;

// Define a variable to hold the HARP engine type
const engineType = H.Map.EngineType['HARP'];

// Create a platform object to communicate with the HERE REST APIs
var platform = new H.service.Platform({
  apikey: window.apikey,
  useHTTPS: secure
}), maptypes = platform.createDefaultLayers({ engineType });

// Instantiate a map in the 'map' div, set the base map to normal
var map = new H.Map(document.getElementById('map'), maptypes.vector.normal.map, {
  engineType,
  center: new H.geo.Point(50.11238, 8.67095),
  zoom: 12,
  pixelRatio: window.devicePixelRatio || 1
});

// Enable the map event system
var mapevents = new H.mapevents.MapEvents(map);

// Enable map interaction (pan, zoom, pinch-to-zoom)
var behavior = new H.mapevents.Behavior(mapevents);

// Enable the default UI
var ui = H.ui.UI.createDefault(map, maptypes);

window.addEventListener('resize', function () {
  map.getViewPort().resize();
});

// Get an instance of the geocoding service:
var geocoder = platform.getSearchService();

var notReverseGeocoded = true;
var address = "", firstMarker = null, lastMarker = null;
// instance of routing service
var router = platform.getRoutingService(null, 8);
var clickCoords = null, polyline;
var group = new H.map.Group();
map.addObject(group);


// add context menu listner  
map.addEventListener('contextmenu', function (e) {
  // reverse geocode at the point of click if not already
  if (notReverseGeocoded) {
    clickCoords = map.screenToGeo(e.viewportX, e.viewportY);
    var reverseGeocodingParameters = {
      in: 'circle:' + clickCoords.lat + "," + clickCoords.lng + ";r=200",
      type: 'address',
      limit: 1,
      lang: 'en-US'
    };
    geocoder.reverseGeocode(reverseGeocodingParameters, function (result) {
      try {
        address = result.items[0].address.label;
        notReverseGeocoded = false;
        // disptach to the context menu event again to add results to the 
        // context menu
        map.dispatchEvent(e);
      }
      catch (e) {
        console.log(e);
      }
    }, function (e) {
      console.log(e);
    });

  }
  else {
    // add address to context menu
    e.items.push(new H.util.ContextItem({
      label: address,

    }));

    // add routing options 
    e.items.push(new H.util.ContextItem({
      label: 'Route from here',
      callback: function () {
        removeObjects(false);
        origin = clickCoords;
        firstMarker = addMarker(clickCoords);
        destination = "";

      }
    }));
    e.items.push(new H.util.ContextItem({
      label: 'Route to here',
      callback: function () {
        removeObjects(true);
        destination = clickCoords;
        lastMarker = addMarker(clickCoords);
        calculateRouteFromAtoB();
        routeNotCalculated = false;
      }
    }));
    notReverseGeocoded = true;
  }
});


// function to calculate route
function calculateRouteFromAtoB() {

  var routeRequestParams = {
    transportMode: 'car',
    return: 'polyline',
    origin: origin.lat + "," + origin.lng,
    destination: destination.lat + "," + destination.lng
  };

  // calculate route
  router.calculateRoute(routeRequestParams, addRouteShapeToMap, function (e) {
    console.log(e);
  });
}

// add route to map
function addRouteShapeToMap(result) {
  try {
    const sections = result.routes[0].sections;
    const lineStrings = [];
    sections.forEach((section) => {
      // convert Flexible Polyline encoded string to geometry
      lineStrings.push(H.geo.LineString.fromFlexiblePolyline(section.polyline));
    });
    const multiLineString = new H.geo.MultiLineString(lineStrings);
    // render route on the map
    const routeLine = new H.map.Polyline(multiLineString, {style: {lineWidth: 5}});
    group.addObject(routeLine);
    // zoom to polyline
    const bounds = routeLine.getBoundingBox();
    map.getViewModel().setLookAtData({bounds});
    map.getViewPort().setPadding(50, 50, 50, 50);  }
  catch (e) {
    console.log(e);
  }


}

// function creates a marker , adds to map
function addMarker(coordinates) {
  var marker = new H.map.Marker({
    lat: clickCoords.lat,
    lng: clickCoords.lng
  });
  group.addObject(marker);
  return marker;
}

// function removes objects from map as required
function removeObjects(onlyPolyline) {
  if (onlyPolyline) {
    if (group.contains(polyline))
      group.removeObject(polyline);
    if (group.contains(lastMarker))
      group.removeObject(lastMarker);
  }
  else {
    group.removeAll();
  }
}



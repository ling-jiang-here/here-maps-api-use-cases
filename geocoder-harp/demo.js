// Check if the site was loaded via secure connection.
var secure = (location.protocol === 'https:') ? true : false;


// Define a variable to hold the HARP engine type
const engineType = H.Map.EngineType['HARP'];


// Create a platform object to communicate with the HERE REST APIs.
var platform = new H.service.Platform({
  apikey: window.apikey,
  useHTTPS: secure
}), maptypes = platform.createDefaultLayers({ engineType });

var geocoder = platform.getSearchService();

// Instantiate a map in the 'map' div, set the base map to normal.
var map = new H.Map(document.getElementById('map'), 
  maptypes.vector.normal.map, {
    engineType,
    center: new H.geo.Point(50.11238, 8.67095),
    zoom: 12,
    pixelRatio: window.devicePixelRatio || 1
});


// Enable the map event system.
var mapevents = new H.mapevents.MapEvents(map);

// Enable map interaction (pan, zoom, pinch-to-zoom).
var behavior = new H.mapevents.Behavior(mapevents);

// Enable the default UI.
var ui = H.ui.UI.createDefault(map, maptypes);

// If the window is resized, we need to resize the viewport.
window.addEventListener('resize', function () { map.getViewPort().resize(); });

// Enable marker drag & drop on map.
enableDragAndDrop(map, behavior);

// // Add API Release information.
// releaseInfoTxt.innerHTML += "JS API: 3." + H.buildInfo().version;
// loadMRSVersionTxt();
// loadGeocoderVersionTxt();

// Focus on search input.
document.getElementById('search').focus();

// Init autocomplete.
initAutocomplete();

/**
 * Initializes the Geocoder Autocomplete widget.
 */
function initAutocomplete() {
  // Configure autocomplete widget via vanilla JavaScript.
  const searchInput = document.getElementById('search');
  const autocompleteList = document.createElement('ul');
  autocompleteList.id = 'autocomplete-list';
  autocompleteList.style.display = 'none';
  searchInput.parentNode.appendChild(autocompleteList);

  searchInput.addEventListener('input', function () {
    if (this.value.length >= 2) {
      fetch('https://autocomplete.search.hereapi.com/v1/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit: 5,
          q: this.value,
          // beginHighlight: '<mark>',
          // endHighlight: '</mark>',
          apikey: window.apikey
        })
      })
      .then(response => response.json())
      .then(data => {
        autocompleteList.innerHTML = '';
        data.suggestions.forEach(item => {
          const label = item.label.split(',').reverse().join();
          const value = label.replace(/(<mark>|<\/mark>)/gm, '');
          const listItem = document.createElement('li');
          listItem.textContent = label;
          listItem.dataset.value = value;
          listItem.addEventListener('click', function () {
            searchInput.value = this.dataset.value;
            autocompleteList.style.display = 'none';
            geocode(this.dataset.value);
          });
          autocompleteList.appendChild(listItem);
        });
        autocompleteList.style.display = 'block';
      })
      .catch(error => console.error('Error:', error));
    } else {
      autocompleteList.style.display = 'none';
    }
  });

  searchInput.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      autocompleteList.style.display = 'none';
      geocode(this.value);
    }
  });

  document.addEventListener('click', function (e) {
    if (!autocompleteList.contains(e.target)) {
      autocompleteList.style.display = 'none';
    }
  });
}

/**
 * Enables object drag & drop on given map.
 */
function enableDragAndDrop(map, behavior) {
  // Disable the default draggability of the underlying map
  // when starting to drag a marker object.
  map.addEventListener('dragstart', function (e) {
    var target = e.target;
    if (target instanceof H.map.Marker) {
      // Disable default behavior related to drag & drop.
      behavior.disable();
    }
  }, false);

  // Re-enable the default draggability of the underlying map
  // when dragging has completed.
  map.addEventListener('dragend', function (e) {
    var target = e.target;
    if (target instanceof H.map.Marker) {
      // Get latest dragged position and reverse geocode it.
      var pointer = e.currentPointer;
      var point = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      reverseGeocode(point);
      // Enable behavior again.
      behavior.enable();
    }
  }, false);

  // Listen to the drag event and move the position of the marker
  // as necessary.
  map.addEventListener('drag', function (e) {
    var target = e.target;
    if (target instanceof H.map.Marker) {
      // Update position.
      var pointer = e.currentPointer;
      var point = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      target.setGeometry(point);
    }
  }, false);
}

/**
 * Wraps geocoder service.
 */
function geocode(address) {
  parameters = {
    searchText: address,
    maxResults: 1
  };

  geocoder.geocode(
    parameters,
    onSuccess,
    onError
  );

  function onSuccess(result) {
    // Clear map.
    map.removeObjects(map.getObjects());

    var locations = result.Response.View[0].Result;

    // Add a marker for each location found
    for (var i = 0; i < locations.length; i++) {
      // Get display position.
      var position = {
        lat: locations[i].Location.DisplayPosition.Latitude,
        lng: locations[i].Location.DisplayPosition.Longitude
      };

      // Create and add marker.
      var marker = new H.map.Marker(position);
      marker.draggable = true;
      map.addObject(marker);

      // Set map view.
      var topLeft = locations[0].Location.MapView.TopLeft;
      var bottomRight = locations[0].Location.MapView.BottomRight;
      var mapview = new H.geo.Rect(topLeft.Latitude, topLeft.Longitude, bottomRight.Latitude, bottomRight.Longitude);
      map.getViewModel().setLookAtData({ bounds: mapview }, true);


      // Set result label to search value.
      var label = locations[i].Location.Address.Label;

      // Update search input.
      $('#search').val(label);
      // Blur from element to prevent keyboard to show up on mobile devices.
      $('#search').blur();
    }
  }

  function onError(error) {
    console.error("Error while geocoding: " + error);
  }
}

/**
 * Wraps reverse geocoder service.
 */
function reverseGeocode(point) {
  parameters = {
    prox: [point.lat, point.lng, 100].join(','),
    mode: 'retrieveAddresses',
    maxResults: 1
  };

  geocoder.reverseGeocode(
    parameters,
    onSuccess,
    onError
  );

  function onSuccess(result) {
    var locations = result.Response.View[0].Result;

    // Add a marker for each location found
    for (var i = 0; i < locations.length; i++) {
      // Set result label to search value.
      var label = locations[i].Location.Address.Label;
      $('#search').val(label);
    }
  }

  function onError(error) {
    console.error("Error while reverse geocoding: " + error);
  }
}

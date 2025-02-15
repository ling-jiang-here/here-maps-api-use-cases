// Define a variable to hold the HARP engine type
const engineType = H.Map.EngineType["HARP"];

// Create a platform object to communicate with the HERE REST APIs
var platform = new H.service.Platform({
    apikey: window.apikey
  }),
  maptypes = platform.createDefaultLayers({ engineType }),
  geocoder = platform.getSearchService();
  var center = {lat: 52.5, lng: 13.4};
  var zoom = 10;

// Instantiate a map in the 'map' div, set the base map to normal
map = new H.Map(
  document.getElementById("map"),
  maptypes.vector.normal.map,
  {
    engineType,
    center,
    zoom,
  }
);

// to store the returned locations
let group = new H.map.Group();

// Enable the map event system
var mapevents = new H.mapevents.MapEvents(map);

// Enable map interaction (pan, zoom, pinch-to-zoom)
var behavior = new H.mapevents.Behavior(mapevents);

// Enable the default UI
var ui = H.ui.UI.createDefault(map, maptypes);

// if the window is resized, we need to resize the viewport
window.addEventListener("resize", function () {
  map.getViewPort().resize();
});

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

// Focus on search input.
document.getElementById("search").focus();
const searchInput = document.getElementById("search");

// Custom autocomplete functionality
searchInput.addEventListener("input", function () {
  const input = searchInput.value;
  if (input.length < 2) return;
  address_list.style.display = "none";
  autocomplete(input, 5, type='auto');
});

// Prepare the params for search
function getParams(addr, limit, type) {
  countries = getSelected("chk_c");
  languages = getSelected("language");
  lookAt = map.getViewModel().getLookAtData();
  viewBound = lookAt.bounds.getBoundingBox();
  bounds = `${viewBound.W},${viewBound.ga},${viewBound.ca},${viewBound.fa}`;

  params = {
    q: addr,
    limit: limit,
    lang: languages.length ? languages : "en-US",
  };

  if (mapViewCheck.checked & type == 'auto') {
    params["in"] = `bbox:${bounds}`;
  } else if (mapViewCheck.checked & type == 'geo') {
	params["at"] = `${lookAt.position.lat},${lookAt.position.lng}`;
	params["in"] = `countryCode:GBR,BEL,SWE,AWS`
  } else if (countryCheck.checked) {
    params["in"] = `countryCode:${countries}`;
  }

  return params;
}

const search_field = document.getElementById("search");
const address_list = document.createElement("ul");
address_list.style.border = "2px solid #000";
address_list.style.backgroundColor = "#f0f0f0";
address_list.style.padding = "10px";
address_list.style.listStyleType = "none";
address_list.addEventListener("mouseout", function (event) {
  // Check if the mouse is moving out of the <ul> element
  if (!address_list.contains(event.relatedTarget)) {
    address_list.innerHTML = "";
    address_list.style.display = "none";
  }
});

// Autocomplete search and create address list
function autocomplete(addr, limit, type='auto') {
  geocoder.autocomplete(getParams(addr,limit,type), onSuccess, onError);

  function onSuccess(result) {
    address_list.innerHTML = "";
    var locations = result.items;

    if (locations.length) {
      locations.forEach((location) => {
        const li = document.createElement("li");
        li.textContent = location.address.label;
        li.style.borderBottom = "1px solid #ccc";
        li.style.padding = "8px";

        li.addEventListener("mouseover", function () {
          li.style.backgroundColor = "#e0e0e0";
        });

        li.addEventListener("mouseout", function () {
          li.style.backgroundColor = "";
        });

        li.addEventListener("click", function (e) {
          const addr = e.target.textContent;
          geocode(addr, 10);
        });

        address_list.appendChild(li);
		address_list.style.display = 'block';
      });

      search.parentNode.insertBefore(address_list, search_field.nextSibling);
    } else {
		address_list.style.display = "none";
      console.log("Autocomplete search found no result!");
    }
  }

  function onError(error) {
    alert("Autocomplete search failed: " + error);
  }
}

// If enter pressed without any selection, geocode the provided text
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
  GBR: "GBR",
  BEL: "BEL",
  SWE: "SWE",
  AUS: "AWS",
  EN: "en-US",
  DE: "de-DE",
  RU: "ru-RU",
  BG: "bg-BG",
};

function getSelected(options) {
  var items = [];
  const selectElement = document.getElementById(options);
  const selectedOptions = selectElement.selectedOptions;
  for (const option of selectedOptions) {
    items.push(mapping[option.value]);
  }
  return items.join(",");
}

// Gecode the provided text
function geocode(addr, limit, type='geo') {
  geocoder.geocode(getParams(addr, limit, type), onSuccess, onError);

  function onSuccess(result) {
    var locations = result.items;
	group.removeAll();

    // Add a marker for each location found
    if (locations.length) {
      locations.forEach((location) => {
        mapview = location.mapView;

        marker = new H.map.Marker({
          lat: location.position.lat,
          lng: location.position.lng,
        });
        group.addObject(marker);
      });
      // Add the locations group to the map
      map.addObject(group);
      // Zoom the map to the location
      locations.length > 1
        ? map
            .getViewModel()
            .setLookAtData({ bounds: group.getBoundingBox() }, true)
        : map
            .getViewModel()
            .setLookAtData({ bounds: group.getBoundingBox(), zoom }, true);
    } else {
      console.log("Geocode search found no result!");
    }
  }

  function onError(error) {
    alert(`Geocoding search failed:\n${error}`);
  }
}

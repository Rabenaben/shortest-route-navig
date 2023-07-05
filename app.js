var map = L.map('map').setView([14.2081, 121.1634], 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // Map
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

var startMarker, endMarker;
var routingControl;

function searchLocation(location, callback) { // Convert the "latLng" into a Name of the Location
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;
  
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var latlng = L.latLng(data[0].lat, data[0].lon);
                callback(latlng);
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.log('Error:', error);
            callback(null);
        });
}

function calculateRoute() { // Gets the Inputted Start and End Location of the User
    var startLocation = document.getElementById('start').value;
    var endLocation = document.getElementById('end').value;

    if (startLocation === '' || endLocation === '') {
        alert('Please enter both start and end locations.');
        return;
    }

    searchLocation(startLocation, function (startLatLng) { // Checks if there is a Marker in the Map to Remove it
        if (startLatLng) {
            searchLocation(endLocation, function (endLatLng) {
                if (endLatLng) {
                    if (startMarker) {
                        map.removeLayer(startMarker);
                    }

                    if (endMarker) {
                        map.removeLayer(endMarker);
                    }

                    startMarker = L.marker(startLatLng, { draggable: false }).addTo(map); // Places New Markers of the New Locations
                    endMarker = L.marker(endLatLng, { draggable: false }).addTo(map);

                    var waypoints = [ // Used to define the Route Path or stops for Routing Calculations
                        L.Routing.waypoint(startLatLng),
                        L.Routing.waypoint(endLatLng)
                    ];

                    if (routingControl) { // Checks if there is an existing Routing Control on the Map
                        map.removeControl(routingControl);
                    }

                    routingControl = L.Routing.control({ // Route Calculation and Display
                        waypoints: waypoints,
                        draggableWaypoints: false,
                        addWaypoints: false,
                    }).addTo(map);

                    var bounds = L.latLngBounds(startLatLng, endLatLng); // Zoom out to show the Route
                    map.fitBounds(bounds);

                } else {
                    alert('End location not found.');
                }
            });
        } else {
            alert('Start location not found.');
        }
    });
}

function removeMarkers() { // Remove Markers and Route
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
        document.getElementById('start').value = '';
    }

    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
        document.getElementById('end').value = '';
    }

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
  
    map.setView([14.2081, 121.1634], 16); // Go back to the Default setView with Default Zoom
}
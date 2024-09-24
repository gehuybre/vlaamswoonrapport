// Initialize an object to hold all Leaflet maps
let maps = {};

// Configuration constants
const INITIAL_ZOOM = 8;
const MAX_ZOOM = 13;

// Function to initialize a map for a specific province
function initializeMap(mapId, provincie) {
    // Create a new Leaflet map instance
    maps[provincie] = L.map(mapId, {
        center: [50.85, 4.35], // Default center; adjust as needed for each province
        zoom: INITIAL_ZOOM,
        zoomControl: false,
        dragging: true, // Enable dragging for interactivity
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
    });

 
map.invalidateSize();


    // Add CartoDB Positron base layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
    }).addTo(maps[provincie]);

    // Path to the province-specific GeoJSON file
    const geojsonPath = `output/static/geojson_per_provincie/gemeentegrenzen_${provincie.replace(" ", "_").toLowerCase()}.json`;

    // Fetch and load the GeoJSON data
    fetch(geojsonPath)
        .then(response => response.json())
        .then(data => {
            // Add GeoJSON layer to the map
            const geojsonLayer = L.geoJSON(data, {
                style: function (feature) {
                    // Style for all municipalities
                    return {
                        color: '#000000',
                        weight: 2,
                        fillOpacity: 0.5,
                        fillColor: '#7fe0de'
                    };
                },
                onEachFeature: function (feature, layer) {
                    // Bind a popup with the municipality name
                    layer.bindPopup('<strong>' + feature.properties.NAAM + '</strong>');

                    // Add click event to navigate to the municipality's report
                    layer.on('click', function (e) {
                        const gemeenteNaam = feature.properties.NAAM.replace(/\s+/g, '_');
                        window.location.href = `report_${gemeenteNaam}.html`;
                    });
                    layer.on({
                        mouseover: function(e) {
                            var layer = e.target;
                            layer.setStyle({
                                fillColor: '#55a6a9',
                                fillOpacity: 0.7
                            });
                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                layer.bringToFront();
                            }
                        },
                        mouseout: function(e) {
                            geojsonLayer.resetStyle(e.target);
                        },
                        click: function(e) {
                            const gemeenteNaam = e.target.feature.properties.NAAM.replace(/\s+/g, '_');
                            window.location.href = `report_${gemeenteNaam}.html`;
                        }
                    });
                }
            }).addTo(maps[provincie]);

            // Fit the map view to the GeoJSON layer
            maps[provincie].fitBounds(geojsonLayer.getBounds());

            // Listen for zoom changes to show/hide labels
            maps[provincie].on('zoomend', function () {
                handleZoomChange(maps[provincie], geojsonLayer);
            });
        })
        .catch(error => console.error(`Error loading GeoJSON for ${provincie}:`, error));
}

// Function to handle zoom changes for labels (if applicable)
function handleZoomChange(mapInstance, geojsonLayer) {
    if (mapInstance.getZoom() === MAX_ZOOM) {
        // Iterate over each layer in the GeoJSON
        geojsonLayer.eachLayer(function (layer) {
            if (layer.feature.properties && layer.feature.properties.NAAM) {
                // Bind a tooltip with the municipality name
                layer.bindTooltip(layer.feature.properties.NAAM, {
                    permanent: true,
                    direction: 'center',
                    className: 'gemeente-label'
                }).openTooltip();
            }
        });
    } else {
        // Remove all tooltips
        geojsonLayer.eachLayer(function (layer) {
            layer.unbindTooltip();
        });
    }
}

// Easing function for smooth zoom transitions (if used elsewhere)
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Expose the initializeMap function to the global scope
window.initializeMap = initializeMap;

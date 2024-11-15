// Initialize an object to hold all Leaflet maps
const maps = {};

// Configuration constants
const INITIAL_ZOOM = 8;
const MAX_ZOOM = 13;

// Function to initialize a map for a specific province
async function initializeMap(mapId, provincie) {
    try {
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

        // Add CartoDB Positron base layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19
        }).addTo(maps[provincie]);

        // Path to the province-specific GeoJSON file
        const geojsonPath = `static/geojson_per_provincie/gemeentegrenzen_${provincie.replace(" ", "_").toLowerCase()}.json`;

        // Fetch and load the GeoJSON data
        const response = await fetch(geojsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Add GeoJSON layer to the map
        const geojsonLayer = L.geoJSON(data, {
            style: {
                color: '#000000',
                weight: 2,
                fillOpacity: 0.5,
                fillColor: '#7fe0de'
            },
            onEachFeature: (feature, layer) => {
                // Bind a popup with the municipality name
                layer.bindPopup(`<strong>${feature.properties.NAAM}</strong>`);

                // Add event listeners
                layer.on({
                    click: (e) => {
                        const gemeenteNaam = feature.properties.NAAM.replace(/\s+/g, '_');
                        window.location.href = `report_${gemeenteNaam}.html`;
                    },
                    mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            fillColor: '#55a6a9',
                            fillOpacity: 0.7
                        });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                    },
                    mouseout: (e) => {
                        geojsonLayer.resetStyle(e.target);
                    }
                });
            }
        }).addTo(maps[provincie]);

        // Fit the map view to the GeoJSON layer
        maps[provincie].fitBounds(geojsonLayer.getBounds());

        // Listen for zoom changes to show/hide labels
        maps[provincie].on('zoomend', () => handleZoomChange(maps[provincie], geojsonLayer));
    } catch (error) {
        console.error(`Error initializing map for ${provincie}:`, error);
    }
}

// Function to handle zoom changes for labels (if applicable)
function handleZoomChange(mapInstance, geojsonLayer) {
    if (mapInstance.getZoom() === MAX_ZOOM) {
        // Iterate over each layer in the GeoJSON
        geojsonLayer.eachLayer((layer) => {
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
        geojsonLayer.eachLayer((layer) => {
            layer.unbindTooltip();
        });
    }
}

// Expose the initializeMap function to the global scope
window.initializeMap = initializeMap;

let map, targetFeature, currentZoom, currentCenter;
const INITIAL_ZOOM = 8;
const MAX_ZOOM = 13;
const ZOOM_LABEL_LEVELS = [9, 11, 11]; // Define zoom levels at which more labels will appear
let displayedLayers = []; // Keep track of displayed layers to manage their labels

function initializeMap(kleuren, gemeente, options = {}) {
    const mapOptions = {
        center: [50.85, 4.35], // Default center for the map
        zoom: INITIAL_ZOOM,    // Default initial zoom level
        zoomControl: false,    // Disable zoom controls
        dragging: true,        // Enable dragging
        scrollWheelZoom: true, // Enable scroll wheel zoom
        ...options // Merge default options with any custom options provided
    };

    map = L.map('map', mapOptions);
    currentZoom = mapOptions.zoom;
    currentCenter = map.getCenter();

    fetch('gemeentegrenzen2.json')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    var fillColor = feature.properties.NAAM === gemeente ? kleuren[0] : '#f7f7f7';
                    return {
                        color: '#000000',
                        weight: 2,
                        fillOpacity: 0.5,
                        fillColor: fillColor
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup('<strong>' + feature.properties.NAAM + '</strong>');

                    layer.on('click', function () {
                        const reportFileName = `report_${feature.properties.NAAM}.html`;
                        window.location.href = reportFileName;
                    });

                    // Store each layer to manage its tooltip visibility
                    displayedLayers.push(layer);
                }
            }).addTo(map);

            targetFeature = data.features.find(f => f.properties.NAAM === gemeente);

            if (window.initializeScrollEffects) {
                window.initializeScrollEffects(gemeente);
            }

            map.on('zoomend', handleZoomChange);
        })
        .catch(error => console.error('Error loading GeoJSON data:', error));
}

function handleZoomChange() {
    const currentZoom = map.getZoom();

    displayedLayers.forEach(layer => {
        // Remove existing labels if the zoom level is lower than the minimum level
        layer.unbindTooltip();

        if (currentZoom >= ZOOM_LABEL_LEVELS[2]) {
            // Show labels for all layers at maximum zoom level
            layer.bindTooltip(layer.feature.properties.NAAM, {
                permanent: true,
                direction: 'center',
                className: 'gemeente-label' // Apply the custom class
            }).openTooltip();
        } else if (currentZoom >= ZOOM_LABEL_LEVELS[1]) {
            // Show labels for layers at medium zoom level
            if (layer.feature.properties.priority <= 2) {
                layer.bindTooltip(layer.feature.properties.NAAM, {
                    permanent: true,
                    direction: 'center',
                    className: 'gemeente-label' // Apply the custom class
                }).openTooltip();
            }
        } else if (currentZoom >= ZOOM_LABEL_LEVELS[0]) {
            // Show labels for important layers at minimum zoom level
            if (layer.feature.properties.priority === 1) {
                layer.bindTooltip(layer.feature.properties.NAAM, {
                    permanent: true,
                    direction: 'center',
                    className: 'gemeente-label' // Apply the custom class
                }).openTooltip();
            }
        }
    });
}

function zoomToGemeente(progress) {
    if (!map || !targetFeature) return;

    const bounds = L.geoJSON(targetFeature).getBounds();
    const initialBounds = map.getBounds();
    const easedProgress = easeInOutCubic(progress);

    const zoomDiff = MAX_ZOOM - INITIAL_ZOOM;
    const targetZoom = INITIAL_ZOOM + (zoomDiff * easedProgress);

    const initialCenter = initialBounds.getCenter();
    const targetCenter = bounds.getCenter();
    const targetLat = initialCenter.lat + (targetCenter.lat - initialCenter.lat) * easedProgress;
    const targetLng = initialCenter.lng + (targetCenter.lng - initialCenter.lng) * easedProgress;

    currentZoom += (targetZoom - currentZoom) * 0.1;
    currentCenter.lat += (targetLat - currentCenter.lat) * 0.1;
    currentCenter.lng += (targetLng - currentCenter.lng) * 0.1;

    map.setView(currentCenter, currentZoom, { animate: false });
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function filterGemeente() {
    const searchValue = document.getElementById('search-bar').value.toLowerCase();
    const gemeenteFeatures = map._layers;

    Object.keys(gemeenteFeatures).forEach((key) => {
        const layer = gemeenteFeatures[key];
        if (layer.feature && layer.feature.properties && layer.feature.properties.NAAM) {
            const gemeenteName = layer.feature.properties.NAAM.toLowerCase();
            if (gemeenteName.includes(searchValue)) {
                layer.setStyle({ fillColor: '#ff0000', color: '#ff0000' });
                layer.openPopup();
            } else {
                layer.setStyle({ fillColor: '#f7f7f7', color: '#000000' });
                layer.closePopup();
            }
        }
    });
}

// Expose functions to the global scope for external use
window.initializeMap = initializeMap;
window.zoomToGemeente = zoomToGemeente;
window.filterGemeente = filterGemeente;

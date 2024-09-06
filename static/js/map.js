let map, targetFeature, currentZoom, currentCenter, targetLayer;
const INITIAL_ZOOM = 8;
const MAX_ZOOM = 13;

function initializeMap(kleuren, gemeente) {
    map = L.map('map', {
        center: [50.85, 4.35],
        zoom: INITIAL_ZOOM,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
    });

    currentZoom = INITIAL_ZOOM;
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
                    
                    // Store the layer of the selected "gemeente"
                    if (feature.properties.NAAM === gemeente) {
                        targetLayer = layer;
                    }
                }
            }).addTo(map);

            targetFeature = data.features.find(f => f.properties.NAAM === gemeente);

            if (window.initializeScrollEffects) {
                window.initializeScrollEffects(gemeente);
            }

            // Listen for zoom changes to show/hide the label
            map.on('zoomend', handleZoomChange);
        })
        .catch(error => console.error('Fout bij het laden van de GeoJSON-data:', error));
}

function handleZoomChange() {
    if (!targetLayer) return;

    if (map.getZoom() === MAX_ZOOM) {
        // Show the label at max zoom level
        targetLayer.bindTooltip(targetLayer.feature.properties.NAAM, {
            permanent: true,
            direction: 'center',
            className: 'gemeente-label'
        }).openTooltip();
    } else {
        // Remove the label at other zoom levels
        targetLayer.unbindTooltip();
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
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

    // Interpolate between current and target values
    currentZoom += (targetZoom - currentZoom) * 0.1;
    currentCenter.lat += (targetLat - currentCenter.lat) * 0.1;
    currentCenter.lng += (targetLng - currentCenter.lng) * 0.1;

    map.setView(currentCenter, currentZoom, {animate: false});
}

window.initializeMap = initializeMap;
window.zoomToGemeente = zoomToGemeente;

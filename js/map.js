// Map Logic
const MapManager = {
    map: null,
    markers: [],

    initHeroMap: function () {
        const container = document.getElementById('hero-map');
        if (!container) return;

        // Initialize map centered on Japan
        this.map = L.map('hero-map', {
            zoomControl: false, // Move zoom control if needed
            attributionControl: false
        }).setView([38.5, 137.0], 5); // Center on Japan

        // Light Theme Tiles (CartoDB Positron for cleaner look)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Add Zoom Control top-right
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        this.plotDisasters();
        this.plotRegions();
    },

    plotDisasters: function () {
        if (!disasterData.alerts) return;

        disasterData.alerts.forEach(alert => {
            if (alert.lat && alert.lng) {
                const disasterType = alert.disasterType || 'earthquake';

                // Use different plotting methods based on disaster type
                if (disasterType === 'earthquake') {
                    this.plotEarthquake(alert);
                } else {
                    this.plotWeatherDisaster(alert);
                }
            }
        });
    },

    // Plot earthquake with intensity zones
    plotEarthquake: function(alert) {
        const mag = parseFloat(alert.mag) || parseFloat(alert.level?.replace('震度', '')) || 3;

        // Calculate seismic intensity zones (震度予測)
        const intensityZones = this.calculateIntensityZones(mag);

        // Plot concentric circles for intensity zones
        intensityZones.forEach((zone, idx) => {
            const circle = L.circle([alert.lat, alert.lng], {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: zone.opacity,
                weight: 2,
                radius: zone.radius,
                dashArray: zone.dashed ? '10, 5' : null
            }).addTo(this.map);

            // Add permanent label showing intensity
            const labelLat = alert.lat + (zone.radius / 111000);
            const label = L.marker([labelLat, alert.lng], {
                icon: L.divIcon({
                    className: 'intensity-label',
                    html: `<div style="background: ${zone.color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">震度${zone.intensity}</div>`,
                    iconSize: [60, 20],
                    iconAnchor: [30, 10]
                })
            }).addTo(this.map);

            circle.bindPopup(`<strong>予測震度: ${zone.intensity}</strong><br><span style="font-size:0.85em;">震源から約${Math.round(zone.radius / 1000)}km</span>`);

            this.markers.push(circle);
            this.markers.push(label);
        });

        // Main marker at epicenter
        const marker = L.marker([alert.lat, alert.lng], {
            icon: L.divIcon({
                className: 'epicenter-marker',
                html: `<div style="background: ${alert.color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [20, 20]
            })
        })
            .addTo(this.map)
            .bindPopup(`
                <div style="font-family: inherit;">
                    <strong style="color:${alert.color}">${alert.type}</strong><br>
                    ${alert.level}<br>
                    <span style="font-size:0.8em">${alert.time}</span><br>
                    <span style="font-size:0.75em; color: #666;">M${mag} - ${alert.message || ''}</span>
                </div>
            `);

        marker.on('click', () => {
            app.showRegionalInfo(null, alert);
        });

        this.markers.push(marker);
    },

    // Plot weather-related disasters (rain, snow, wind, etc.)
    plotWeatherDisaster: function(alert) {
        const icon = alert.icon || 'fa-triangle-exclamation';
        const typeInfo = disasterData.disasterTypes[alert.disasterType];
        const radius = alert.radius || 50000;

        // Draw affected area as a semi-transparent circle
        const circle = L.circle([alert.lat, alert.lng], {
            color: alert.color,
            fillColor: alert.color,
            fillOpacity: 0.15,
            weight: 2,
            radius: radius,
            dashArray: '8, 4'
        }).addTo(this.map);

        // Add label for the area
        const labelLat = alert.lat + (radius / 111000);
        const label = L.marker([labelLat, alert.lng], {
            icon: L.divIcon({
                className: 'disaster-label',
                html: `<div style="background: ${alert.color}; color: white; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid ${icon}"></i> ${alert.level}
                </div>`,
                iconSize: [80, 24],
                iconAnchor: [40, 12]
            })
        }).addTo(this.map);

        circle.bindPopup(`
            <div style="font-family: inherit; min-width: 180px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="background: ${alert.color}15; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${alert.color};">
                        <i class="fa-solid ${icon}" style="font-size: 1.1rem;"></i>
                    </div>
                    <strong style="color:${alert.color}">${alert.type}</strong>
                </div>
                <div style="background: ${alert.color}; color: white; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">${alert.level}</div>
                <p style="font-size:0.9em; margin: 6px 0;">${alert.message}</p>
                <span style="font-size:0.8em; color: #666;">${alert.time}</span>
            </div>
        `);

        this.markers.push(circle);
        this.markers.push(label);

        // Main icon marker at center
        const marker = L.marker([alert.lat, alert.lng], {
            icon: L.divIcon({
                className: 'disaster-marker',
                html: `
                    <div style="
                        background: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        border: 3px solid ${alert.color};
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${alert.color};
                        font-size: 1.2rem;
                    ">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(this.map);

        marker.on('click', () => {
            app.showRegionalInfo(null, alert);
        });

        this.markers.push(marker);
    },

    calculateIntensityZones: function (magnitude) {
        // Simplified seismic intensity decay model
        // Based on M (magnitude), estimate intensity at various distances
        const m = parseFloat(magnitude);
        if (isNaN(m)) return [];

        const zones = [];

        // Zone definitions: [maxIntensity, radiusKm, color, opacity, dashed]
        // Intensity decreases with distance
        if (m >= 7) {
            zones.push({ intensity: '7', radius: 10000, color: '#8B0000', opacity: 0.4, dashed: false });
            zones.push({ intensity: '6強', radius: 30000, color: '#D50000', opacity: 0.3, dashed: false });
            zones.push({ intensity: '6弱', radius: 50000, color: '#FF5722', opacity: 0.25, dashed: true });
            zones.push({ intensity: '5強', radius: 100000, color: '#FF9800', opacity: 0.2, dashed: true });
            zones.push({ intensity: '5弱', radius: 150000, color: '#FFD600', opacity: 0.15, dashed: true });
        } else if (m >= 6) {
            zones.push({ intensity: '6強', radius: 15000, color: '#D50000', opacity: 0.35, dashed: false });
            zones.push({ intensity: '6弱', radius: 30000, color: '#FF5722', opacity: 0.3, dashed: false });
            zones.push({ intensity: '5強', radius: 60000, color: '#FF9800', opacity: 0.25, dashed: true });
            zones.push({ intensity: '5弱', radius: 100000, color: '#FFD600', opacity: 0.2, dashed: true });
            zones.push({ intensity: '4', radius: 150000, color: '#FFC107', opacity: 0.15, dashed: true });
        } else if (m >= 5) {
            zones.push({ intensity: '5強', radius: 20000, color: '#FF9800', opacity: 0.3, dashed: false });
            zones.push({ intensity: '5弱', radius: 50000, color: '#FFD600', opacity: 0.25, dashed: false });
            zones.push({ intensity: '4', radius: 80000, color: '#FFC107', opacity: 0.2, dashed: true });
            zones.push({ intensity: '3', radius: 120000, color: '#4CAF50', opacity: 0.15, dashed: true });
        } else if (m >= 4) {
            zones.push({ intensity: '4', radius: 30000, color: '#FFC107', opacity: 0.25, dashed: false });
            zones.push({ intensity: '3', radius: 60000, color: '#4CAF50', opacity: 0.2, dashed: true });
            zones.push({ intensity: '2', radius: 100000, color: '#2196F3', opacity: 0.15, dashed: true });
        } else {
            zones.push({ intensity: '3', radius: 40000, color: '#4CAF50', opacity: 0.2, dashed: false });
            zones.push({ intensity: '2', radius: 80000, color: '#2196F3', opacity: 0.15, dashed: true });
        }

        return zones;
    },

    plotRegions: function () {
        // Optional: Could add polygons for regions
        // For now, defined regions in data.js can be used for FlyTo
    },

    refreshAlerts: function (alerts) {
        if (!this.map) return;

        // Remove existing layers (except tiles)
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                this.map.removeLayer(layer);
            }
        });

        this.markers = [];
        this.plotDisasters();
    },

    flyToRegion: function (regionKey) {
        const region = disasterData.regions[regionKey];
        if (region && region.coordinates) {
            this.map.flyTo(region.coordinates, 8, {
                animate: true,
                duration: 1.5
            });
            // Show info
            app.showRegionalInfo(regionKey);
        } else if (regionKey === 'all') {
            this.map.flyTo([38.5, 137.0], 5, {
                animate: true,
                duration: 1.5
            });
            app.showRegionalInfo('all');
        }
    }
};

// Initialize when DOM is ready (called by app.js or here)
// document.addEventListener('DOMContentLoaded', () => {
//     MapManager.initHeroMap();
// });

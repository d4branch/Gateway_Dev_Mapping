function addMarkers(map, data) {
    data.forEach((property) => {
     if (!property.Latitude || !property.Longitude) return;

const marker = L.circleMarker([property.Latitude, property.Longitude], {
   
            radius: 8,
            fillColor: "#007BFF",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        const popupContent = `
            <b>${property.PropertyName}</b><br>
            ${property.Address}<br>
            ${property.City}, ${property.State} ${property.Zip}<br><br>
            Phone: ${property.Phone}<br>
            Email: ${property.Email}<br><br>
            Regional: ${property.RegionalManager}<br>
            Compliance: ${property.Compliance}<br>
        `;
        marker.bindPopup(popupContent);
        marker.addTo(map);
    });
}

window.onload = async () => {
    const map = L.map("map", {
        center: [32.8, -86.6],
        zoom: 6,
        maxBounds: [
            [24.396308, -125.0],
            [49.384358, -66.93457]
        ],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    try {
    const response = await fetch("https://raw.githubusercontent.com/d4branch/gateway-property-map/main/cleaned_properties_with_coords_colored.json?cb=" + Date.now());
    const properties = await response.json();
    addMarkers(map, properties);
} catch (error) {
    console.error("Failed to load property data:", error);
}

};

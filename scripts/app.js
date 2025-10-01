// app.js — Owner-based filtering + popups aligned to final_properties_with_coords_and_rvp.json

let allProps = [];
let markers = [];

function ensureOwnerFilterContainer() {
  let el = document.getElementById("owner-filter");
  if (!el) {
    // create a simple left column if it doesn't exist
    const wrap = document.createElement("div");
    wrap.id = "filters";
    wrap.style.position = "absolute";
    wrap.style.left = "8px";
    wrap.style.top = "8px";
    wrap.style.zIndex = "1000";
    wrap.style.background = "white";
    wrap.style.padding = "8px";
    wrap.style.maxHeight = "90vh";
    wrap.style.overflow = "auto";
    wrap.style.borderRadius = "6px";
    wrap.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    document.body.appendChild(wrap);

    el = document.createElement("div");
    el.id = "owner-filter";
    wrap.appendChild(el);
  }
  return el;
}

function renderOwnerFilter(props) {
  const el = ensureOwnerFilterContainer();

  const owners = [...new Set(props.map(p => (p.owner?.trim() || "Unknown")))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  el.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Owner</div>
    <div id="owner-filter-list">
      ${owners.map(o =>
        `<label style="display:block; font-size:14px; line-height:1.6;">
           <input type="checkbox" class="ownerChk" value="${o.replace(/"/g, "&quot;")}"> ${o}
         </label>`
      ).join("")}
      <button id="owner-clear" style="margin-top:8px;">Clear</button>
    </div>
  `;

  el.addEventListener("change", () => refresh());
  document.getElementById("owner-clear").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".ownerChk").forEach(cb => { cb.checked = false; });
    refresh();
  });
}

function applyOwnerFilter(props) {
  const selected = [...document.querySelectorAll(".ownerChk:checked")].map(i => i.value);
  if (!selected.length) return props;
  return props.filter(p => (p.owner?.trim() || "Unknown") && selected.includes(p.owner?.trim() || "Unknown"));
}

function clearMarkers(map) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function addMarkers(map, data) {
  data.forEach((p) => {
    // skip missing or zero coords
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) return;

    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: "#007BFF",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });

    const popupContent = `
      <b>${p.name ?? ""}</b><br>
      ${p.address ?? ""}<br>
      ${p.city ?? ""}, ${p.state ?? ""} ${p.zip ?? ""}<br><br>
      Phone: ${p.office_phone ?? ""}<br>
      Email: ${p.manager_email ?? ""}<br><br>
      Owner: ${p.owner ?? "—"}<br>
      Compliance: ${p.compliance ?? ""}<br>
    `;

    marker.bindPopup(popupContent);
    marker.addTo(map);
    markers.push(marker);
  });
}

let mapInstance = null;

async function refresh() {
  clearMarkers(mapInstance);
  const filtered = applyOwnerFilter(allProps);
  addMarkers(mapInstance, filtered);
}

window.onload = async () => {
  mapInstance = L.map("map", {
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
  }).addTo(mapInstance);

  try {
    // use a relative path so it works on GitHub Pages
    const url = `final_properties_with_coords_and_rvp.json?cb=${Date.now()}`;
    const response = await fetch(url);
    allProps = await response.json();

    renderOwnerFilter(allProps);
    refresh();
  } catch (err) {
    console.error("Failed to load property data:", err);
  }
};

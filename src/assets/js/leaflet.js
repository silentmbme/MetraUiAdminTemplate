(function () {
  'use strict';
  function initializeMaps() {
    if (typeof L === 'undefined') return;
    const maps = new Map();
    const center = [51.5074, -0.105];
    const places = [
      {name: 'Westminster', coords: [51.5007, -0.1246]},
      {name: 'London Eye', coords: [51.5033, -0.1195]},
      {name: 'St Paul&#39;s Cathedral', coords: [51.5138, -0.0984]},
      {name: 'Tower Bridge', coords: [51.5055, -0.0754]}
    ];
    const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const accent = 'rgb(' + token('--theme-secondary-rgb') + ')';
    const info = 'rgb(' + token('--theme-info-rgb') + ')';
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tiles = () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: attribution});
    const ids = ['leaflet-street', 'leaflet-shapes', 'leaflet-popup', 'leaflet-pins', 'leaflet-route', 'leaflet-layers'];
    ids.forEach(id => {
      const container = document.getElementById(id); if (!container) return;
      const map = L.map(container, {scrollWheelZoom: false}).setView(center, 13);
      const base = tiles().addTo(map);
      const status = document.querySelector('[data-leaflet-status="' + id + '"]');
      base.on('tileerror', () => {if (status) status.textContent = 'Map tiles could not load. Check your internet connection.';});
      if (id === 'leaflet-shapes') {
        L.circle([51.508, -0.115], {radius: 650, color: accent, fillOpacity: 0.18, weight: 2}).addTo(map).bindPopup('Sample service area &middot; 650 m radius');
        L.polygon([[51.515, -0.095], [51.506, -0.085], [51.511, -0.066], [51.519, -0.077]], {color: info, fillOpacity: 0.22, weight: 2}).addTo(map).bindPopup('Sample coverage boundary');
      }
      if (id === 'leaflet-popup') {
        places.forEach(place => L.marker(place.coords, {title: place.name.replace('&#39;', "'")}).addTo(map).bindPopup('<strong>' + place.name + '</strong><br>London landmark'));
        map.on('click', event => L.popup().setLatLng(event.latlng).setContent('Coordinates: ' + event.latlng.lat.toFixed(4) + ', ' + event.latlng.lng.toFixed(4)).openOn(map));
      }
      if (id === 'leaflet-pins') places.forEach((place, index) => {
        const icon = L.divIcon({className: 'custom-leaflet-pin', html: '<span class="map-pin ' + (index === 1 ? 'map-pin-info' : index === 2 ? 'map-pin-success' : '') + '">' + (index + 1) + '</span>', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]});
        L.marker(place.coords, {icon: icon, title: place.name.replace('&#39;', "'")}).addTo(map).bindPopup(place.name);
      });
      if (id === 'leaflet-route') {
        const route = L.polyline(places.map(place => place.coords), {color: accent, weight: 4, opacity: 0.85}).addTo(map);
        places.forEach((place, index) => L.circleMarker(place.coords, {radius: 7, color: accent, fillColor: '#fff', fillOpacity: 1, weight: 3}).addTo(map).bindPopup('Stop ' + (index + 1) + ': ' + place.name));
        map.fitBounds(route.getBounds(), {padding: [30, 30]});
        if (status) status.textContent = 'Illustrative route connecting four stops; select a stop for details.';
      }
      if (id === 'leaflet-layers') {
        const locations = L.layerGroup(places.map(place => L.marker(place.coords, {title: place.name.replace('&#39;', "'")}).bindPopup(place.name))).addTo(map);
        const coverage = L.layerGroup([L.circle(center, {radius: 1200, color: info, fillOpacity: 0.15})]);
        const humanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {maxZoom: 19, attribution: attribution + ', Tiles style by <a href="https://www.hotosm.org/">HOT</a>, hosted by <a href="https://www.openstreetmap.fr/">OSM France</a>'});
        humanitarian.on('tileerror', () => {if (status) status.textContent = 'Map tiles could not load. Check your internet connection.';});
        L.control.layers({'Street map': base, 'Humanitarian map': humanitarian}, {'Landmarks': locations, 'Sample coverage': coverage}).addTo(map);
      }
      maps.set(id, map);
    });
    document.querySelectorAll('[data-leaflet-reset]').forEach(button => button.addEventListener('click', () => {
      const map = maps.get(button.dataset.leafletReset); if (!map) return;
      map.closePopup(); map.setView(center, 13, {animate: false});
    }));
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(entries => entries.forEach(entry => {
        if (entry.contentRect.width && entry.contentRect.height) maps.get(entry.target.id)?.invalidateSize({pan: false});
      }));
      maps.forEach((map, id) => observer.observe(document.getElementById(id)));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeMaps, {once: true});
  else initializeMaps();
})();

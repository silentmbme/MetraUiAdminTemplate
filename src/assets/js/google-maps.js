(function () {
  'use strict';
  let initialized = false;
  let failed = false;
  const showUnavailable = (errorMessage = 'Google Maps could not load. Check your internet connection.') => document.querySelectorAll('.google-demo').forEach(container => {
    container.replaceChildren(); const message = document.createElement('div');
    message.className = 'google-map-empty'; message.textContent = errorMessage; container.append(message);
  });
  window.googleMapsLoadFailed = () => {failed = true; showUnavailable();};
  window.gm_authFailure = () => {
    failed = true;
    showUnavailable('Google Maps authorization failed. Check the API key, billing, and allowed website addresses.');
  };
  function initializeMaps() {
    if (initialized || failed) return;
    if (!window.google?.maps || typeof GMaps === 'undefined') {showUnavailable(); return;}
    initialized = true;
    const maps = new Map();
    const center = {lat: 51.5074, lng: -0.105};
    const places = [{lat: 51.5007, lng: -0.1246, title: 'Westminster'}, {lat: 51.5033, lng: -0.1195, title: 'London Eye'}, {lat: 51.5138, lng: -0.0984, title: 'St Paul&#39;s Cathedral'}, {lat: 51.5055, lng: -0.0754, title: 'Tower Bridge'}];
    const color = name => 'rgb(' + getComputedStyle(document.documentElement).getPropertyValue(name).trim() + ')';
    const accent = color('--theme-secondary-rgb'), info = color('--theme-info-rgb');
    const ids = ['google-map', 'google-satellite', 'google-terrain', 'map-markers', 'google-route', 'map-geofencing', 'map-layers'];
    ids.forEach(id => {
      if (!document.getElementById(id)) return;
      const position = id === 'google-terrain' ? {lat: 54.46, lng: -3.09} : center;
      const zoom = id === 'google-terrain' ? 10 : 13;
      const instance = new GMaps({el: '#' + id, lat: position.lat, lng: position.lng, zoom: zoom, scrollwheel: false, mapId: window.googleMapsConfig?.mapId || 'DEMO_MAP_ID', mapType: id === 'google-satellite' ? 'satellite' : id === 'google-terrain' ? 'terrain' : 'roadmap'});
      maps.set(id, {map: instance.map, center: position, zoom: zoom});
      const addLandmark = place => {
        const marker = new google.maps.marker.AdvancedMarkerElement({map: instance.map, gmpClickable: true, position: {lat: place.lat, lng: place.lng}, title: place.title.replace('&#39;', "'")});
        const popup = new google.maps.InfoWindow({content: '<strong>' + place.title + '</strong><br>London landmark'});
        marker.addEventListener('gmp-click', () => popup.open({map: instance.map, anchor: marker}));
      };
      if (id === 'map-markers') places.forEach(addLandmark);
      if (id === 'google-route') {
        instance.drawPolyline({path: places.map(place => [place.lat, place.lng]), strokeColor: accent, strokeOpacity: 0.9, strokeWeight: 4});
        places.forEach(addLandmark);
        const status = document.querySelector('[data-google-status="' + id + '"]');
        if (status) status.textContent = 'Illustrative route connecting four landmarks; select a pin for details.';
      }
      if (id === 'map-geofencing') {
        instance.drawCircle({lat: center.lat, lng: center.lng, radius: 900, strokeColor: accent, strokeWeight: 2, fillColor: accent, fillOpacity: 0.18});
        instance.drawPolygon({paths: [[51.515, -0.095], [51.506, -0.085], [51.511, -0.066], [51.519, -0.077]], strokeColor: info, strokeWeight: 2, fillColor: info, fillOpacity: 0.22});
      }
      if (id === 'map-layers') {
        const traffic = new google.maps.TrafficLayer(); traffic.setMap(instance.map);
        const button = document.getElementById('google-traffic-toggle');
        button?.addEventListener('click', () => {
          const enabled = !traffic.getMap(); traffic.setMap(enabled ? instance.map : null);
          button.setAttribute('aria-pressed', String(enabled)); button.textContent = enabled ? 'Traffic on' : 'Traffic off';
        });
      }
    });
    const panoramaPosition = {lat: 42.3455, lng: -71.0983};
    const panorama = GMaps.createPanorama({el: '#streetview-map', lat: panoramaPosition.lat, lng: panoramaPosition.lng, pov: {heading: 60, pitch: -10}});
    panorama.addListener('status_changed', () => {
      const status = document.querySelector('[data-google-status="streetview-map"]');
      if (status && panorama.getStatus() !== 'OK') status.textContent = 'Street View is unavailable at this location.';
    });
    document.querySelectorAll('[data-google-reset]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.googleReset;
      if (id === 'streetview-map') {panorama.setPosition(panoramaPosition); panorama.setPov({heading: 60, pitch: -10}); return;}
      const entry = maps.get(id); if (entry) {entry.map.setCenter(entry.center); entry.map.setZoom(entry.zoom);}
    }));
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(entries => entries.forEach(entry => {
        if (!entry.contentRect.width || !entry.contentRect.height) return;
        const map = maps.get(entry.target.id)?.map;
        if (map) {const position = map.getCenter(); google.maps.event.trigger(map, 'resize'); map.setCenter(position);}
        else if (entry.target.id === 'streetview-map') google.maps.event.trigger(panorama, 'resize');
      }));
      document.querySelectorAll('.google-demo').forEach(container => observer.observe(container));
    }
  }
  window.initializeGoogleMaps = () => {
    if (failed || initialized) return;
    const library = document.createElement('script');
    library.src = '../assets/libs/gmaps/gmaps.min.js';
    library.onload = () => {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeMaps, {once: true});
      else initializeMaps();
    };
    library.onerror = () => showUnavailable('The local map library could not load. Check the project build.');
    document.head.append(library);
  };
  const loadApi = () => {
    const key = window.googleMapsConfig?.apiKey?.trim();
    if (!key) {
      showUnavailable('Google Maps is not configured. Add an active API key in google-maps-config.js.');
      return;
    }
    const script = document.createElement('script');
    const params = new URLSearchParams({key: key, loading: 'async', callback: 'initializeGoogleMaps', libraries: 'marker'});
    script.src = 'https://maps.googleapis.com/maps/api/js?' + params.toString();
    script.async = true;
    script.onerror = window.googleMapsLoadFailed;
    document.head.append(script);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadApi, {once: true});
  else loadApi();
})();

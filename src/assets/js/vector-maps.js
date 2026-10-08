(function () {
  function initializeVectorMaps() {
  'use strict';
  if (typeof jsVectorMap === 'undefined') return;
  const instances = new Map();
  const color = (token) => {
    const probe = document.createElement('span');
    probe.style.color = token; probe.style.display = 'none'; document.body.append(probe);
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g); probe.remove();
    return rgb && rgb.length >= 3 ? '#' + rgb.slice(0, 3).map(v => Math.round(Number(v)).toString(16).padStart(2, '0')).join('') : '#5e78fd';
  };
  const hubs = [
    {name: 'New York', coords: [40.71, -74.01]},
    {name: 'Toronto', coords: [43.65, -79.38]},
    {name: 'Madrid', coords: [40.42, -3.70]},
    {name: 'Moscow', coords: [55.76, 37.62]},
    {name: 'Singapore', coords: [1.35, 103.82]}
  ];
  const definitions = [
    ['world-outline', 'world_merc', '--theme-secondary-rgb'],
    ['world-markers', 'world_merc', '--theme-success-rgb'],
    ['world-routes', 'world_merc', '--theme-info-rgb'],
    ['world-density', 'world_merc', '--theme-secondary-rgb'],
    ['us-map', 'us_merc_en', '--theme-primary-rgb'],
    ['canada-map', 'canada', '--theme-info-rgb'],
    ['spain-map', 'spain', '--theme-secondary-rgb'],
    ['russia-map', 'russia', '--theme-warning-rgb']
  ];
  definitions.forEach(([id, mapName, token]) => {
    if (!document.getElementById(id)) return;
    const fill = color('rgb(var(' + token + '))');
    const surface = color('var(--theme-custom-white)');
    const status = document.querySelector('[data-map-status="' + id + '"]');
    const hasMarkers = id === 'world-markers' || id === 'world-routes';
    const options = {
      selector: '#' + id, map: mapName, backgroundColor: 'transparent',
      zoomOnScroll: false, regionsSelectable: true, regionsSelectableOne: true,
      regionStyle: {
        initial: {fill: id === 'world-outline' ? surface : fill, fillOpacity: id.startsWith('world-') ? 0.25 : 0.65, stroke: id === 'world-outline' ? fill : surface, strokeWidth: 0.7},
        hover: {fill: fill, fillOpacity: 0.8}, selected: {fill: fill, fillOpacity: 1}
      },
      markers: hasMarkers ? hubs : [],
      markerStyle: {initial: {r: 6, fill: fill, stroke: surface, strokeWidth: 2}, hover: {r: 8}},
      onRegionClick: function (event, code) {if (status) status.textContent = 'Selected region: ' + (this.regions[code]?.config.name || code);},
      onMarkerClick: function (event, index) {if (status && hubs[index]) status.textContent = 'Selected location: ' + hubs[index].name;}
    };
    if (id === 'world-routes') {
      options.lines = [{from: 'New York', to: 'Madrid'}, {from: 'Madrid', to: 'Moscow'}, {from: 'Moscow', to: 'Singapore'}, {from: 'Toronto', to: 'New York'}];
      options.lineStyle = {stroke: fill, strokeWidth: 1.5, curvature: 0.2, strokeDasharray: '4 3'};
    }
    if (id === 'world-density') {
      options.regionStyle.initial.fill = color('var(--theme-default-background)');
      options.regionStyle.initial.fillOpacity = 1;
      const values = {US: 90, CA: 65, ES: 48, RU: 35, BR: 55, IN: 80, AU: 40, GB: 70, FR: 60, DE: 75, CN: 85, ZA: 25};
      const background = color('var(--theme-default-background)');
      const blend = (amount) => '#' + [1, 3, 5].map(offset => {
        const base = parseInt(background.slice(offset, offset + 2), 16);
        const accent = parseInt(fill.slice(offset, offset + 2), 16);
        return Math.round(base + (accent - base) * amount).toString(16).padStart(2, '0');
      }).join('');
      // jsVectorMap 1.x uses an ordinal lookup, not a continuous color scale.
      const scale = Object.fromEntries(Object.values(values).map(value => [value, blend(0.2 + value / 100 * 0.8)]));
      options.series = {regions: [{attribute: 'fill', scale: scale, values: values}]};
      const legend = document.querySelector('.vector-workspace .map-scale');
      if (legend) legend.style.background = 'linear-gradient(90deg, ' + blend(0.2) + ', ' + fill + ')';
    }
    instances.set(id, new jsVectorMap(options));
  });
  const resizeMap = (id) => {
    const map = instances.get(id);
    if (map?.container && map.canvas && map.container.isConnected) map.updateSize();
  };
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(entries => entries.forEach(entry => resizeMap(entry.target.id)));
    instances.forEach((map, id) => observer.observe(document.getElementById(id)));
  }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVectorMaps, {once: true});
  } else {
    initializeVectorMaps();
  }
})();

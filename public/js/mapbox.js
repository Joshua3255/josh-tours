/* eslint-disable */
console.log('hello from the client side');
const locations = JSON.parse(
  document.getElementById('map').dataset.locations
);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoia2h5anMiLCJhIjoiY2x5aGVlOHc2MDJnZzJqcTE5ZGY2dmVodSJ9.fmBKHUZHTYbNdG3EazI1Yg';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/khyjs/clyhesmsu01in01p87j0b2fjb',
  scrollZoom: false
  // center: [-118.113491, 34.111745],
  // zoom: 7,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});

// Disable focus on the map container
document
  .getElementById('map')
  .setAttribute('tabindex', '-1');

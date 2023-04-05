
<script lang="ts">

  // Svelte imports:
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import 'leaflet/dist/leaflet.css'

  // Library imports:
  import L, { type LatLngExpression } from 'leaflet';
  import 'proj4leaflet';

  // Imports from Stores.svelte:
  import { system, type Crd, type Ridge, type Pos } from 'src/lib/Stores';

  // Map settings.
  const EPSG5136value = '+proj=tmerc +lat_0=0 +lon_0=-7 +k=0.999997 +x_0=200000 +y_0=-6000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs';
  const kortalUrlLendis = 'https://gis.us.fo/arcgis/services/lendiskort/us_lendiskort/MapServer/WMSServer'

  // Center of map.
  let center: LatLngExpression = [61.9, -6.85];

  // The CRS:
  let crs = new L.Proj.CRS('EPSG:5316', EPSG5136value, {
    origin: [-5423100, 4002100],
    resolutions: [
      1083.735500804335,
      541.8677504021675,
      270.93387520108377,
      135.46693760054188,
      67.73346880027094,
      33.86673440013547,
      16.933367200067735,
      8.466683600033868,
      4.233341800016934,
      2.116670900008467,
      1.0583354500042335,
      0.5291677250021167,
      0.26458386250105836,
      0.13229193125052918,
      0.06614596562526459,
    ],
  })

  // Dynamically updating variables:
  $: selectedRidges = $system.chart.selected;
  $: storedRidges = $system.stored.ridges;
  $: updateLayersInMap(selectedRidges, storedRidges);

  function updateLayersInMap(selected: Ridge[], stored: Ridge[]) {

    stored.forEach(st => {
      $system.map.removeLayer(st.marker.onMap)
      $system.map.removeLayer(st.polyline.onMap)
    })

    selected.forEach(sel => {
      sel.marker.onMap.addTo($system.map)
      sel.polyline.onMap.addTo($system.map)
    })
  }

  function resizeMap() {
    if($system.map) {$system.map.invalidateSize()}
  }

  onMount(() => {

    $system.map = L.map('leafletmap', {
      crs,
      maxZoom: 14,
      minZoom: 0,
    })

    var wmsLayerLendis = L.tileLayer.wms(kortalUrlLendis, {
      layers: 'Sjógvur,Oyggjar - bólkur,Brúksøki,Hillshade - bólkur,Strandalinja,Áir,Bygningar,Vegir - bólkur,Bygdir - bólkur',
      format: 'image/png',
      version: '1.3.0',
      crs,
    }).addTo($system.map);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   crs: crs,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo($system.map);

    // var wmsLayerMynd = L.tileLayer.wms(kortalUrlMynd, {
    //   layers: '0',
    //   format: 'image/png',
    //   // version: '1.3.0',
    //   crs: crs,
    // }).addTo($system.map);

    // var wmsLayerHaedd = L.tileLayer.wms(kortalUrlHaedd, {
    //   // Layer numbering:
    //   // '0' to '3' show in Zoom=14-9
    //   // '4' to '6' show in Zoom=8-7, 
    //   // '7' to '9' show in Zoom=6
    //   // '10' to '11' show in Zoom=5-1
    //   // The main layers are: 0, 4, 7, 10 (For the related zoom).
    //   layers: '0,4,7,10',
    //   format: 'image/png',
    //   // version: '1.3.0',
    //   crs: crs,
    //   transparent: true,
    // }).addTo($system.map);

    $system.map.setView(center, 2);

  })


</script>

<div id="leafletmap" on:resize={resizeMap}/>
<svelte:window on:resize={resizeMap}/>

<style>
  #leafletmap { 
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 1;
  }

</style>

  
  
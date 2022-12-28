<script lang="ts">
  // Imports:
  import { onMount } from 'svelte';
  import { system } from 'src/lib/Stores';
  import { convertLatLngToPos, convertPosToPixel, getSingleHeight } from './Functions';
  import L from 'leaflet';
  import 'proj4leaflet'

  const kortalUrlHaedd = 'https://gis.us.fo/arcgis/services/haeddarkurvar/us_haeddarkurvar_2009_2m/MapServer/WMSServer';
  const kortalUrlMynd = 'https://gis.us.fo/arcgis/services/myndakort/us_myndakort_fotm/MapServer/WMSServer'
  const EPSG5136value = '+proj=tmerc +lat_0=0 +lon_0=-7 +k=0.999997 +x_0=200000 +y_0=-6000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'


  // Define the global variable L to new variable:
  $system.leaf = L;
  
  // Define variable in this scope.
  var theMarker

  // Center of map.
  var center = [62, -7];
  
  onMount(() => {
    
    var crs = new L.Proj.CRS('EPSG:4326', EPSG5136value, {
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

    $system.map = $system.leaf.map('map', {
      // crs: crs,
    })

    $system.leaf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 8,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo($system.map);

    // var wmsLayerHaedd = $data.leaf.tileLayer.wms(kortalUrlHaedd, {
    //   maxZoom: 20,
    //   minZoom: 8,
    // }).addTo($data.map);

    // var wmsLayerMynd = $data.leaf.tileLayer.wms(kortalUrlMynd, {
    //   maxZoom: 20,
    //   minZoom: 8,
    // }).addTo($data.map);

    $system.map.setView(center, 8);

    // map.on('moveend', function() {
    // 	console.log(map.getBounds())
    // })

    var greenIcon = $system.leaf.icon({
      iconUrl:	'src/Image/leaf-green.png',

      iconSize:		[38, 95],
      iconAnchor:		[0, 0],
      popupAnchor:	[0, 0]

      

    })

    $system.map.on('click', (e) => {
      mapClick(e)
    })
    
  })
  

  async function mapClick(e) {

    var crd = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }

    placeMarker(crd)
    const pos = convertLatLngToPos(crd)
    const px = convertPosToPixel(pos)

    console.log(px)

    const height = await getSingleHeight(px)

    $system.info.crd = crd;
    $system.info.pos = pos;
    $system.info.mapHeight = height;
  }

  function placeMarker(pos: ({lat: Number, lng: Number})) {
    // Add marker to map at click location; add popup window
    if (theMarker != undefined) {
      $system.map.removeLayer(theMarker);
    }

    theMarker = new $system.leaf.marker(pos).addTo($system.map);
  }


</script>

<div id="map">

</div>




<style>
  #map { 
    height: 100%;
    width: 100%;
  }

</style>

  
  
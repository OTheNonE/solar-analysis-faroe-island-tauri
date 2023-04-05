
<script lang="ts">
  
  // Imports from Stores.svelte:
  import { convertF } from './Functions/ConvertUnit';
  import { removeDecimals, waitForElm } from './Functions/Functions';
  import { getHeight, getHeightFromREST } from './Functions/GetHeight';
  import { system } from './Stores';
  

  // Variables storing current position:
  export let pos = {x: '', y: ''};
  export let crd = {lng: '', lat: ''};
  export let level = '';

  let executing = false;

  system.update(o => {

    waitForElm('#leafletmap').then(() => {
      $system.map.on('mousemove', async e => {
    
        if (!executing) {
          executing = true
          await updateCurrentPosLevel(e)
          executing = false
        }

      })
    })

    return o
  })

  async function updateCurrentPosLevel(e) {
    let crd_temp = {lat: e.latlng.lat, lng: e.latlng.lng}
    let abs_pos_temp = convertF.LatLngToAbsPos(crd_temp);
    let pos_temp = convertF.LatLngToPos(crd_temp)
    let bbox = $system.heightMap.boundingBox;
    let px = convertF.PosToPixel(pos_temp, bbox)

    // let level_temp = await getHeight(px)
    let level_temp = await getHeightFromREST(abs_pos_temp)

    pos = {
      x: pos_temp.x.toFixed(0),
      y: pos_temp.y.toFixed(0),
    }

    crd = {
      lng: crd_temp.lng.toFixed(5),
      lat: crd_temp.lat.toFixed(5)
    }

    level = level_temp.toFixed(0);
  }

</script>


<div class="coordinates">
  x={pos.x}m y={pos.y}m, lng={crd.lng} lat={crd.lat}, h={level}m
</div>

<style>
  .coordinates {
    position: absolute;
    bottom: 3px;
    left: 3px;
    
    margin: auto;
    font-size: 10px;
    color: white;
    
    height: 1.2em;
    line-height: 1.2em;
    padding: 0px 0.3em 0px 0.3em; 
    background-color: rgba(0, 0, 0, 0.3);

    z-index: 2;
  }
</style>
<script lang="ts">
  import { system } from 'src/lib/Stores';
  import { getAllHeight, getAreaHeight, getMountainCurve } from 'src/lib/Functions';

  // $: info = $data.info
  $: pos = {
    x: $system.info.pos.x.toFixed(0),
    y: $system.info.pos.y.toFixed(0),
  }
  $: crd = {
    lng: $system.info.crd.lng.toFixed(5),
    lat: $system.info.crd.lat.toFixed(5),
  }

  $: level = $system.info.mapHeight.toFixed(1);

  async function getArea(e) {

    let px = {
      xmin: 7600 - 300,
      ymin: 3579 - 300,
      xmax: 7601 + 300,
      ymax: 3580 + 300,
    }

    let value = await getAreaHeight(px);
    console.log(value["width"])
  }

  async function handleClick(e) {
    getMountainCurve()
  } 


</script>

<div>
  Your position is now: <br>
  Lng: {crd.lng}, Lat: {crd.lat}, <br>
  x: {pos.x}, y: {pos.y}, <br>
  with height: {level}m
</div>

<button on:click={getArea}>
  Get Area
</button>

<button on:click={handleClick}>
  Start Calculation
</button>


<style>

</style>
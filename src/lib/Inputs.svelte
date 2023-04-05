

<script lang="ts">
  import { fromArrayBuffer } from 'geotiff';
  import { system, type Pos } from 'src/lib/Stores';
  import ChartSettings from './ChartSettings.svelte';
  import { convertF } from './Functions/ConvertUnit';
    import { getBoundingBox, getGeoTIFFImage } from './Functions/FetchFunctions';

  async function tester_1(e) {
    var kortalUrl = 'src/assets/FO_DSM_2017_FOTM_25M_DEFLATE_UInt16.tif'

    let start = Date.now();
    console.log(kortalUrl);

    // let image = await fetch(kortalUrl)
    //   .then(response  => response.arrayBuffer())
    //   .then(tiff      => fromArrayBuffer(tiff))
    //   .then(result    => result.getImage())

    let image = await getGeoTIFFImage(kortalUrl)
    let bbox = getBoundingBox(image)

    let radius = 800; // 10^4 * 10^4 = 10^8
    let pos_min: Pos = { x: -radius, y: radius }
    let pos_max: Pos = { x: radius, y: -radius }
    let px_min = convertF.PosToPixel(pos_min, bbox);
    let px_max = convertF.PosToPixel(pos_max, bbox);
    let options = { window: [ px_min.x, px_min.y, px_max.x, px_max.y ] }

    let mid = Date.now();
    console.log(`Load time: ${mid - start} ms`);
    
    let promises = [];
    let n = 25;
    for (let i = 0; i < n; i++) {
      promises.push(image.readRasters(options)
        .then(result => {

          if (!ArrayBuffer.isView(result[0])) {
            throw new Error("It is not an array!")
          }

          return {
            heights: result[0],
            w: result.width,
            h: result.height
          }
        }).catch(error => {
          throw new Error(error)
        })
      )
    }

    await Promise.all(promises)

    

    let end = Date.now();
    console.log(`Read time: ${end - mid} ms`);

    // for (let i = 0; i < 1; i++) {}

  }

  async function tester_2(e) {

    var kortalUrl = 'src/assets/TIFF_x1-20_y1-20.tif'

    let start = Date.now();

    for (let i = 0; i < 40; i++) {
      let result = await fetch(kortalUrl)
        .then(response  => response.arrayBuffer())
        .then(tiff      => fromArrayBuffer(tiff))
        .then(result    => result.getImage())
    }

    let end = Date.now();

    console.log(`Execution time: ${end - start} ms`);

  }

</script>


<div class="current">

  <header> Current Selection </header>

  <button on:click={() => console.log($system)}>
    console.log($system)
  </button>

  <button on:click={tester_1}>
    Full image
  </button>
<!-- 
  <button on:click={tester_2}>
    Spread image
  </button> -->
</div>

<hr>

<div class="ridge">

  <header> Ridges </header>

  <!-- <button on:click={getRidge}>
    Find mountain curve from current marker
  </button>

  <form>

    <label for="name"> Name </label>
    <input type="text" id="fname" name="fname" bind:value={newRidgeName}>
    <button type="button" on:click={() => addRidgeToStorage(newRidgeName)}>
      Add current mountain to storage
    </button>


  </form> -->
  

  <div> Current ridges stored: </div>
  {#each $system.stored.ridges as mc}
    <div> {mc.label} </div>
  {/each}
  
</div>

<hr>

<header> Chart </header>

<ChartSettings/>

<hr>

<header> Settings </header>



<style>
  header {
    text-align: center;
  }

</style>
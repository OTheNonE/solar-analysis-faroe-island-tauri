
<script>
  import { onMount } from 'svelte';
  import Map from "./lib/Map.svelte";
  import Inputs from "./lib/Inputs.svelte";
  import * as bara_fyri_at_kompila from 'src/lib/Load';
  import Chart from "./lib/Chart.svelte";
  import Split from 'split-grid';

  let rowSplitter, columnSplitter;

  onMount(() => {
		Split({
			rowGutters: [{
				track: 1,
				element: rowSplitter,
			}],
			columnGutters: [{
				track: 1,
				element: columnSplitter,
			}],
		})
	});
  
</script>



<div class="root">
	<div class="input">
    <Inputs/>
	</div>
	<div class="map">
    <Map/>
	</div>
	<div class="chart">
    <Chart/>
	</div>

	<div class="row-splitter" bind:this={rowSplitter} />
	<div class="column-splitter" bind:this={columnSplitter} />
</div>

<style>

  .root {
    display: grid;
    grid-template-areas:
      'top      c-split rights'
      'r-split  c-split rights'
      'bottom   c-split rights';
    grid-template-rows: 1fr 5px 1fr;
    grid-template-columns: 1fr 5px 1fr;
    width: 100vw;
    height: 100vh;
  }

  .input {
    overflow: hidden;
    grid-area: rights;
  }

  .map {
    overflow: hidden;
    grid-area: top;
  }

  .chart {
    /* overflow: hidden; */
    min-width: 0;
    min-height: 0;
    grid-area: bottom;
  }

  .row-splitter {
    grid-area: r-split;
    cursor: row-resize;
    background-color: grey;
  }

  .column-splitter {
    grid-area: c-split;
    cursor: col-resize;
    background-color: grey;
  }

</style>



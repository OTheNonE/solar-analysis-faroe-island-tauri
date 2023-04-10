
<script>

  // Svelte imports:
  import { onMount } from 'svelte';

  // Library imports:
  import Split from 'split-grid';

  // Imports from Stores.svelte:
  import { system } from 'src/lib/Stores';

  // Imports from function typescript files:

  // Components imports:
  import Map from "./lib/Map.svelte";
  import Inputs from "./lib/Inputs.svelte";
  import ChartVisual from './lib/ChartVisual.svelte';

  // Yeaah...
  import * as only_for_compiling1 from 'src/lib/Load';
  import * as only_for_compiling2 from 'src/lib/Functions/RidgePopup';
  import CurrentPosition from './lib/CurrentPosition.svelte';

  let rowSplitter //, columnSplitter;

  onMount(() => {
		Split({
			rowGutters: [{
				track: 1,
				element: rowSplitter,
			}],
      
			// columnGutters: [{
			// 	track: 1,
			// 	element: columnSplitter,
			// }],
		})
	});
  
</script>



<div class="root">
	<div class="input">
    <Inputs/>
	</div>
	<div class="map">
    <Map/>
    <CurrentPosition/>
	</div>
	<div class="chart">
    <ChartVisual/>
	</div>

	<div class="row-splitter" bind:this={rowSplitter} />
	<div class="column-splitter"/>
</div>

<style>

  .root {
    display: grid;
    grid-template-areas:
      'top      c-split rights'
      'r-split  c-split rights'
      'bottom   c-split rights';
    grid-template-rows: 1fr 5px 1fr;
    grid-template-columns: auto 5px 300px;
    width: 100vw;
    height: 100vh;
  }

  .input {
    overflow: hidden;
    grid-area: rights;
  }

  .map {
    position: relative;
    overflow: hidden;
    grid-area: top;
  }

  .chart {
    display: flex;
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
    background-color: grey;
  }

</style>




<script lang="ts">
  // Imports:
  import { system  } from 'src/lib/Stores';
  import SunCalc from 'suncalc';
  import type { ChartTypes, Sun, Pos, Ridge } from 'src/lib/Stores';
  import { chartF } from './Functions/Chart';
  import { updateColorOfLayer } from './Functions/MapLayers';

  // Variables:
  let chartTypes: ChartTypes[] = ['Hillshade', 'Sunrise', 'Sunset']
  let selectedChart: ChartTypes = 'Hillshade';
  let towns: Ridge[];
  let selected: Ridge[] = [];
  let noneSelect = 'none';

  $system.chart.sun = {
    dataset: undefined,
    show: false,
    color: "#ffff00",
    date: "2022-01-01"
  }

  let sun = $system.chart.sun;

  // Dynamically updated:
  $: sun = $system.chart.sun;
  $: $system.chart.selected = selected;
  $: towns = $system.stored.ridges;

  sun.dataset = chartF.createDataset('Sun', sun.color);
  chartF.updateSunDataset(sun.dataset, new Date(sun.date))

  // Functions:
  function sunSwitch() {
    if (sun.show) {
      chartF.hideSunDataset()
    } else {
      chartF.showSunDataset()
    }
  }

  function addTown(town) {
    noneSelect = 'none';
    selected = [...selected, town]
    chartF.showDatasets(selected.map(a => a.dataset))
  }

  function removeTown(index) {
    selected.splice(index, 1)
    selected = selected;
    chartF.showDatasets(selected.map(a => a.dataset))
  }

  // function townSelected(town: Ridge, item?: Ridge) {
  //   for (let o of selected) {
  //     if (town.label == o.label && item == undefined) {
  //       return true
  //     } else if (town.label == o.label && town.label != item.label) {
  //       return true
  //     }
  //   }
  //   return false
  // }

  function townSelected(town: Ridge) {
    for (let o of selected) {
      if (town.label == o.label) {
        return true
      }
    }
    return false
  }

  function test() {
    let date = new Date(2022, 1, 1)
    let sunPos = SunCalc.getPosition(date, 62, -7);
    console.log(date.getFullYear())
  }

</script>

<div class='settings'>

  <header> Chart Type </header>

  <select bind:value={$system.chart.chartType} on:change={chartF.updateChartType}>
    {#each chartTypes as chartType}
    <option value={chartType}> {chartType} </option>
    {/each}
  </select>

  <br>
  
  <header> Locations </header>

  <div class="select">

    <button class="showSun" on:click={sunSwitch}> 
      {sun.show ? 'Hide' : 'Show'} sun
    </button>

    <input class="colorpicker" type="color" 
    bind:value={sun.color}
    on:change={() => chartF.changeChartColor(sun.dataset, sun.color)}/>

    {#each selected as item, index}

    <button on:click={() => {removeTown(index)}}> Remove </button>

    <div class="name"> {item.label} </div>

    <!-- on:change riggar ikki pga okkurt við {#each} -->
    <!-- <select disabled={selected.length == towns.length} 
    bind:value={item}
    on:change={() => chartF.updateDatasets(selected.map(a => a.dataset))}>
      {#each towns as town} {#if !townSelected(town, item)}
      <option value={town}> {town.name} </option>
      {/if} {/each}
    </select> -->

    <input class="colorpicker" type="color"
    bind:value={item.color}
    on:change={() => {
      chartF.changeChartColor(item.dataset, item.color)
      updateColorOfLayer(item.polyline.onMap, item.color)
    }}/>

    {/each}
    
    <button class="placeholder"> Remove </button>
  
    <!-- {#key selected} Hesin blokkurin virkar áðrenn ein bygd verður vald... -->
    <select disabled={selected.length == towns.length} 
    bind:value={noneSelect}
    on:change={() => {addTown(noneSelect)}}>
      {#each towns as town} {#if !townSelected(town)}
      <option value={town}> {town.label} </option>
      {/if} {/each}
      <option value='none'> none </option>
    </select>
    <!-- {/key} -->
    
  </div>

  <input type="date" bind:value={sun.date}
  on:change={() => chartF.updateSunDataset(sun.dataset, new Date(sun.date))}>

  <!-- <DateInput bind:value={sun.date}
  on:input={() => chartF.updateSunDataset(sun.dataset, sun.date)}
  format={'yyyy-MM-dd'}/> -->

  <button on:click={test}>
    Heey
  </button>

</div>



<style>

  .name {
    font-size: 8;
  }

  .select {
    display: grid;
    grid-template-columns: min-content auto min-content;
    grid-template-rows: auto;
  }

  .colorpicker {
    height: 100%;
  }

  .showSun {
    grid-column-start: span 2;
    justify-self: stretch;
  }

  .placeholder {
    visibility: hidden;
  }

  .settings {
    width: 100%;
  }

</style>


<script lang="ts">
  import { onMount } from 'svelte';
  import Chart, { type ChartOptions, ScatterController } from 'chart.js/auto';
  import { system } from './Stores';
  import { chartF, optionsHillshade } from './Functions/Chart';

  let ctx;
  let chartCanvas;
  let chart;
  
  $: $system.chart.chart = chart;

  onMount(() => {
    ctx = chartCanvas.getContext('2d');
    chart = newChart()
  })

  function newChart() {
    let aChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: []
      },
      options: optionsHillshade
    })

    return aChart
  }


</script>

<div class='canvas'>
  <canvas bind:this={chartCanvas}/>
</div>

<style>


  .canvas {
    overflow: hidden;
    flex-grow: 1;
  }


</style>
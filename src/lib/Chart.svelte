<script>

  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { system } from './Stores';

  let chartValues; // = [20, 10, 5, 2, 20, 30, 45];
  let chartLabels; // = [0, 1, 2, 3, 4, 5, 6];
  let ctx;
  let chartCanvas;
  var chart

  onMount(() => {

    ctx = chartCanvas.getContext('2d');
    chart = newChart()
  })

  function newChart() {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Mountain Profile',
          borderColor: 'rgb(255, 99, 132)',
          // backgroundColor: 'rgb(255, 99, 132)',
          data: chartValues,
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
      }
    })

    return chart
  }

  function setValues() {
    chart.data.labels = []
    chart.data.datasets[0].data = []

    $system.info.mountainCurve.forEach(val => {
        
      chart.data.datasets[0].data.push(val.v_lat.toFixed(2));
      chart.data.labels.push(val.v_lng.toFixed(2));
    })

    
    chart.update()
  }

</script>


<div>
    
  <button on:click={setValues}>
    Set values    
  </button>

  <canvas bind:this={chartCanvas}/>

    
</div>



<style>
  div {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
  }

  button {
    width: 100%;
    height: auto;
  }

</style>
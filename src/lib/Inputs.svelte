

<script lang="ts">
  import { system } from 'src/lib/Stores';
  import ChartSettings from './ChartSettings.svelte';

  async function tester(e) {
  }

</script>


<div class="current">

  <header> Current Selection </header>

  <button on:click={() => console.log($system)}>
    console.log($system)
  </button>

  <button on:click={tester}>
    test
  </button>
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
<script>
  import { createEventDispatcher } from 'svelte'

  export let showFields = false
  export let value = ''

  $: {
    dispatch('updateQuery', value)
  }

  const dispatch = createEventDispatcher()
  let focused = false
</script>

<div class="search--query">
  <div class="search--query-wrapper" class:focused>
    <input
      type="search"
      name="q"
      placeholder="Filter with keywords"
      bind:value={value}
      on:focus={() => focused = true}
      on:blur={() => focused = false}
    >
    <button type="submit">
      Search
    </button>
  </div>
  {#if showFields}
    <div class="search--fields-wrapper">
      <label class="inline">
        <input type="checkbox" name="title">
        Title
      </label>
      <label class="inline">
        <input type="checkbox" name="description">
        Description
      </label>
      <label class="inline">
        <input type="checkbox" name="version">
        Version
      </label>
      <label class="inline">
        <input type="checkbox" name="composition-date">
        Composition date
      </label>
      <label class="inline">
        <input type="checkbox" name="composition-location">
        Composition location
      </label>
    </div>
  {/if}
</div>
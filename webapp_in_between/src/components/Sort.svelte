<script>
  let { qsState, onSort } = $props()

  const items = $state([
    {
      key: 't',
      dir: 'asc',
      label: 'Title',
    },
    {
      key: 'u',
      dir: 'asc',
      label: 'Update',
    },
    {
      key: 'd',
      dir: 'asc',
      label: 'Duration',
    },
    {
      key: 'c',
      dir: 'asc',
      label: 'Composition date',
    },
  ])

  const statefulItems = $derived(items.map(item => ({
    ...item,
    active: item.key === qsState.sort.field,
    dir: item.key === qsState.sort.field ? qsState.sort.dir : item.dir,
  })))

  function sort(item) {
    onSort({
      field: item.key,
      dir:
        item.key === qsState.sort.field
          ? qsState.sort.dir === 'asc'
            ? 'desc'
            : 'asc'
          : item.dir,
    })
  }
</script>

<ul class="works-sort">
  {#each statefulItems as item}
    <li class:active={item.active} class:desc={item.dir === 'desc'}>
      <button onclick={() => sort(item)}>{item.label}</button>
    </li>
  {/each}
</ul>

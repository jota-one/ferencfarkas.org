<script lang="ts">
  import type { QS_SORT_FIELDS, QsSort, QsSortDir, QsState } from "../../types"

  type Props = {
    qsState: QsState
    onSort: (sortObj: QsSort) => void
  }

  type SortItem = {
    key: typeof QS_SORT_FIELDS[number]
    dir: QsSortDir
    label: string
  }

  type StatefulSortItem = SortItem & {
    active: boolean
  }

  let { qsState, onSort }: Props = $props()

  const items = $state<SortItem[]>([
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

  const statefulItems = $derived<StatefulSortItem[]>(items.map(item => ({
    ...item,
    active: item.key === qsState.sort.field,
    dir: item.key === qsState.sort.field ? qsState.sort.dir : item.dir,
  })))

  const sort = (item: StatefulSortItem) => {
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

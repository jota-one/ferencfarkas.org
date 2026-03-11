<script lang="ts">
  import QueryIcon from './QueryIcon.svelte'

  type Props = {
    showFields?: boolean
    value?: string
    loading?: boolean
    failed?: boolean
    onUpdateQuery?: (query: string) => void
  }

  let {
    showFields = false,
    value = '',
    loading = false,
    failed = false,
    onUpdateQuery,
  }: Props = $props()

  let focused = $state(false)

  const placeholder = $derived(failed
    ? 'Failed to load search index'
    : loading
      ? 'Loading search index...'
      : 'Filter with keywords')

  const onKeyUp = (e: KeyboardEvent) => {
    const newValue = (e.target as HTMLInputElement)?.value.trim()

    if (value === newValue) {
      return
    }

    onUpdateQuery(newValue)
  }

</script>

<div class="search--query">
  <div class="search--query-wrapper" class:loading class:failed class:focused>
    <QueryIcon {loading} {failed} />
    <input
      type="search"
      name="q"
      readonly={failed || loading}
      {value}
      {placeholder}
      onkeyup={onKeyUp}
      onfocus={() => (focused = !failed && !loading)}
      onblur={() => (focused = false)}
    />
    <button type="submit"> Search </button>
  </div>
  {#if showFields}
    <div class="search--fields-wrapper">
      <label class="inline">
        <input type="checkbox" name="title" />
        Title
      </label>
      <label class="inline">
        <input type="checkbox" name="description" />
        Description
      </label>
      <label class="inline">
        <input type="checkbox" name="version" />
        Version
      </label>
      <label class="inline">
        <input type="checkbox" name="composition-date" />
        Composition date
      </label>
      <label class="inline">
        <input type="checkbox" name="composition-location" />
        Composition location
      </label>
    </div>
  {/if}
</div>

<script lang="ts">
  import type { FacetGroup, GroupedFacetMap } from '../../types'
  import { facets as facetsHelper } from '../helpers'

  type Props = {
    group: FacetGroup
    label: string
    facets: GroupedFacetMap
    onRefine: (facet: string) => void
  }

  const MAX_FACETS = 5

  let {
    group,
    label,
    facets,
    onRefine
  }: Props = $props()

  let expanded = $state(false)

  const getFacets = (facets: GroupedFacetMap) => {
    return Object.entries(facets)
      .sort((a, b) => b[1].count > a[1].count ? 1 : -1)
      .map(([ value, facet ]) => ({ value, facet }))
  }

  const facetsList = $derived(getFacets(facets).slice(0, expanded ? Object.keys(facets).length : MAX_FACETS))
</script>

<ul>
  {#each facetsList as { value, facet }}
    <li>
      <label>
        <input
          type="checkbox"
          name={facetsHelper.serialize(group, value).toString()}
          checked={facet.active}
          onclick={() => onRefine(facetsHelper.serialize(group, value))}
        >
        <span class="facet--name">{facet.label}</span>
        <span class="facet--count">{facet.count}</span>
      </label>
    </li>
  {/each}
</ul>
{#if Object.keys(facets).length > MAX_FACETS}
  <button
    class="link facet--more"
    onclick={(e) => { e.preventDefault(); expanded = !expanded }}
  >
    {#if expanded}
      Show first {MAX_FACETS} {label.toLowerCase()}
    {:else}
      Show more {label.toLowerCase()} ({Object.keys(facets).length - MAX_FACETS})
    {/if}
  </button>
{/if}
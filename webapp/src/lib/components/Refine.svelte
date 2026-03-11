<script lang="ts">
  import type { ActiveFacetTuple, Category } from '../../types'
  import type { Genre } from '../../types'
  import type { Publisher } from '../../types'
  import type { QsState } from '../../types'
  import type { FilteredWork } from '../../types'
  import { facets as facetsHelper } from '../helpers'
  import { qs as qsService } from '../services'
  import RefineTitle from './RefineTitle.svelte'
  import Query from './Query.svelte'
  import FacetGroup from './FacetGroup.svelte'

  type Props = {
		activeFacets: ActiveFacetTuple[]
    categories?: Record<string, Category>
    genres?: Record<string, Genre>
    publishers?: Record<string, Publisher>
    qsState: QsState
    works: FilteredWork[]
    loadSearchIndex: () => void
    onClearState: () => void
    onUpdateQuery: (query: string) => void
    onRefine: (facet: string) => void
	}

  let {
    activeFacets = [],
    categories = {},
    genres = {},
    publishers = {},
    qsState,
    works = [],
    loadSearchIndex,
    onClearState,
    onUpdateQuery,
    onRefine
  }: Props = $props()

  let wrapper: HTMLElement | undefined = undefined
  let collapsedItems = $state<FacetGroup[]>([])
  let facetsList = $derived(_getFacets())

  const cropped = $derived(isCropped(wrapper))

  function _getFacets() {
    const list = facetsHelper.getFacets({
      activeFacets,
      categories,
      genres,
      publishers,
      works,
    })

    // Feed collapsedItems based on facets config
    if (!collapsedItems) {
      collapsedItems = list
        .filter(item => item.def.collapsed)
        .map(item => item.group as FacetGroup)
    }

    // Force opening facet groups with active filters
    for (const activeFacetTuple of qsState.activeFacets) {
      const [ group ] = activeFacetTuple

      if (collapsedItems.includes(group as FacetGroup)) {
        collapsedItems = collapsedItems.filter((g: FacetGroup) => g !== group as FacetGroup)
      }
    }

    return list
  }

  function isCropped(wrapper?: HTMLElement) {
    if (!wrapper) {
      return
    }

    return wrapper.offsetHeight > window.innerHeight
  }

  const toggleRefine = () => {
    document.querySelector('.refine')?.classList.toggle('open')
  }

  const toggleCollapse = (group: FacetGroup) => {
    if (collapsedItems.includes(group)) {
      collapsedItems = collapsedItems.filter(g => g !== group)
    } else {
      collapsedItems = [...collapsedItems, group]
    }
  }
</script>

<div class="refine--wrapper" bind:this={wrapper} class:cropped>
  <button class="refine--handler" onclick={toggleRefine}> <!-- preventDefault missing here -->
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z" />
    </svg>
    <span class="refine--handler-label">
      <RefineTitle count={works.length} />
    </span>
  </button>
  <div class="refine--inner">
    <h3>
      <RefineTitle count={works.length} />
      <span class="spacer"></span>
      <button
        aria-label="clear filters"
        title="clear filters"
        disabled={JSON.stringify(qsState) === JSON.stringify(qsService.defaultState)}
        onclick={onClearState}
      >
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21 8H3V6H21V8M13.81 16H10V18H13.09C13.21 17.28 13.46 16.61 13.81 16M18 11H6V13H18V11M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z"
          />
        </svg>
      </button>
    </h3>
    {#await loadSearchIndex()}
      <Query loading />
    {:then}
      <Query value={qsState.query} {onUpdateQuery} />
    {:catch}
      <Query failed />
    {/await}
    <div class="facets">
      {#each facetsList as { group, def }}
        <div class="facet {group}" class:collapsed={collapsedItems.includes(group as FacetGroup)}>
          <h4>
            <button
              class="collapse"
              class:open={!collapsedItems.includes(group as FacetGroup)}
              aria-label="toggle facets group"
              title="toggle facets group"
              onclick={() => toggleCollapse(group as FacetGroup)}
            ></button>
            {def.label}
          </h4>
          <FacetGroup {group} label={def.label} facets={def.facets} {onRefine} />
        </div>
      {/each}
    </div>
  </div>
</div>

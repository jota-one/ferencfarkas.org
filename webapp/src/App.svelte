<script lang="ts">
  import { onMount } from 'svelte'
  import type { ActiveFacetTuple, Catalogue, FilteredWork, I18n, QsSort, RenderedWork, Work } from './types'
  import { APP_CONTAINER_ID } from './lib/config'
  import { facets as facetsHelper } from './lib/helpers'
  import {
    catalogue as catalogueService,
    cms as cmsService,
    data as dataService,
    qs as qsService,
    scroll as scrollService
  } from './lib/services'
  import Refine from './lib/components/Refine.svelte'
  import Sort from './lib/components/Sort.svelte'
  import Spinner from './lib/components/Spinner.svelte'
  import WorkList from './lib/components/WorkList.svelte'

  type Props = {
		workId?: string
	}

  const { workId }: Props = $props()

  const embedded = $derived(Boolean(workId))
  let catalogue = $state<Omit<Catalogue, 'works'>>()
  let i18n = $state<I18n>()
  let loading = $state(true)
  let loadingError = $state()
  let qsState = $state(qsService.defaultState)
  let worksWithFacets = $state<FilteredWork[]>([])
  let allWorks = $state<Work[]>([])
  let searchIndex = $state<any>(null)
  let app: HTMLFormElement

  // Re-filter whenever qsState or searchIndex change
  const filteredWorks = $derived.by(() => {
    if (!worksWithFacets.length) {
      return []
    }

    return catalogueService.filterWorks({
      ...qsState,
      searchIndex,
      embedded,
      works: worksWithFacets
    })
  })

  $effect(() => {
    if (!loading) {
      qsService.sync(qsState)
    }
  })

  // App initialisation
  onMount(async () => {
    try {
      const catalogueData = await dataService.getCatalogueData()
      allWorks = catalogueData.catalogue.works
      catalogue = {
        categories: catalogueData.catalogue.categories,
        fields: catalogueData.catalogue.fields,
        genres: catalogueData.catalogue.genres,
        publishers: catalogueData.catalogue.publishers,
      }
      i18n = catalogueData.i18n

      const indexData = await dataService.getIndexData()
      searchIndex = window.lunr.Index.load(indexData)

      scrollService.initScrollBehaviors(app)

      // Set qsState from URL
      qsState = qsService.load(workId)

      cmsService.customizeSection(APP_CONTAINER_ID)

      // Compute facets once; filteredWorks $derived takes it from here
      worksWithFacets = facetsHelper.setFacets(catalogueData.catalogue.works)

      loading = false
    } catch(e: any) {
      loadingError = e.message
    }
  })

  // Interaction handlers
  const refine = (tuple: ActiveFacetTuple) => {
    const [group, facet] = tuple
    const isActive = qsState.activeFacets.some(([g, f]) => g === group && f === facet)

    qsState = {
      ...qsState,
      activeFacets: isActive
        ? qsState.activeFacets.filter(([g, f]) => !(g === group && f === facet))
        : [...qsState.activeFacets, tuple]
    }
  }

  const clearState = () => {
    qsState = { ...qsService.defaultState }
  }

  const sort = (sortObj: QsSort) => {
    qsState = { ...qsState, sort: sortObj }
  }

  const toggleReworks = (workId: string) => {
    qsState = {
      ...qsState,
      reworksOf: qsState.reworksOf === workId ? '' : workId
    }
  }

  const updateQuery = (query: string) => {
    qsState = { ...qsState, query }
  }
</script>

<form
  class="catalogue search"
  class:embedded
  class:rework-mode={qsState.reworksOf}
  bind:this={app}
  onsubmit={e => e.preventDefault()}
>
  <div class="works">
    <div class="row">
      <div class="column list">
        {#if !embedded && !qsState.reworksOf}
          <Sort {qsState} onSort={sort} />
        {/if}
        {#if loading}
          <div class="catalogue--loader">
            <Spinner size={20} radius={8} stroke={2.5} />
            <p>Loading catalogue data</p>
          </div>
        {:else if loadingError}
          <p>
            Failed to initialize catalogue: <strong>{loadingError}</strong>.
          </p>
          {console.error(loadingError)}
        {:else}
          <!-- <pre>{JSON.stringify(qsState, null, 2)}</pre> -->
          <WorkList
            {embedded}
            {qsState}
            categories={catalogue?.categories}
            fields={catalogue?.fields}
            fullList={allWorks as RenderedWork[]}
            filteredList={filteredWorks as RenderedWork[]}
            i18n={i18n}
            publishers={catalogue?.publishers}
            onRefine={refine}
            onToggleReworks={toggleReworks}
          />
        {/if}
      </div>
      {#if !embedded}
        <div class="column refine">
          <Refine
            activeFacets={qsState.activeFacets}
            categories={catalogue?.categories}
            genres={catalogue?.genres}
            publishers={catalogue?.publishers}
            {qsState}
            works={filteredWorks}
            loadSearchIndex={dataService.getIndexData}
            onUpdateQuery={updateQuery}
            onRefine={refine}
            onClearState={clearState}
          />
        </div>
      {/if}
    </div>
  </div>
</form>
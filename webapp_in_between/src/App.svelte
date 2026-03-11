<script>
  import { onMount } from 'svelte'
  import endpoints from './configs/endpoints'
  import { setFacets } from './helpers/facets'
  import { initScrollBehaviors, scrollToTop } from './helpers/scroll'
  import { defaultState as defaultQsState, load as loadQS, sync as syncQs } from './services/qs'
  import Pagination from './components/Pagination.svelte'
  import Refine from './components/Refine.svelte'
  import Sort from './components/Sort.svelte'
  import Spinner from './components/Spinner.svelte'
  import WorkList from './components/WorkList.svelte';

	let { workId } = $props()

  let app
  let index = {} // lunr search index object
  let works = [] // full list of works (unfiltered)
  let data = $state({})
  let qsState = $state(defaultQsState)
  let mounted = $state(false)

  const embedded = $derived(Boolean(workId))
  const results = $derived(filterWorks({ ...qsState, index, works }))

  $effect(() => {
    if (mounted && index && !embedded) {
      syncQs(qsState)
      scrollToTop()
    } else {
      qsState = loadQS(workId)
    }
  })

  onMount(() => {
    mounted = true
    initScrollBehaviors(app)

    if (!embedded) {
      customizeSection(document.getElementById('catalogue-app'))
    }
  })

  function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  function customizeSection(container) {
    let section = container

    while (section.tagName.toLowerCase() !== 'section') {
      section = section.parentNode
    }

    if (section) {
      section.style.overflow = 'hidden'
    }
  }

  async function loadCatalogue() {
    const responses = {}

    await Promise.all(
      Object.entries(endpoints)
        .filter(([key]) => key !== 'index')
        .map(([key, url]) =>
          fetch(url)
            .then(res => res.json())
            .then(data => {
              responses[key] = data
            })
        )
    )

    works = setFacets(responses.catalogue.works)
    data = responses
  }

  async function loadSearchIndex() {
    try {
      const res = await fetch(endpoints.index)
      const data = await res.json()

      if (res) {

        // @ts-ignore
        index = lunr.Index.load(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  function filterWorks({ activeFacets, index, query, reworksOf, sort, works }) {
    console.log('works', JSON.parse(JSON.stringify(works)))
    let results = [...works]

    console.log('r0', JSON.parse(JSON.stringify(results)))

    if (reworksOf) {
      console.log('r1', JSON.parse(JSON.stringify(results)))
      results = works.filter(
        work => work.id === reworksOf || work.rework === reworksOf
      )
    } else {
      console.log('r2', JSON.parse(JSON.stringify(results)))
      results = handleQuery({ works, index, query })
      console.log('r3', JSON.parse(JSON.stringify(results)))
      results = handleFacets({ activeFacets, works: results })
    }

    if (embedded || reworksOf) {
      console.log('r4', JSON.parse(JSON.stringify(results)))
      return results.sort(a => (a.id === reworksOf ? -1 : 1))
    }

    console.log('r5', JSON.parse(JSON.stringify(results)))

    return results.sort((a, b) => {
      const getDuration = work => parseInt(`${work.duration || 0}`)
      const getYear = work =>
        parseInt(`${work.composition_date || 1905}`.substr(0, 4))

      switch (sort.field) {
        case 'u':
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateA > dateB
            ? qsState.sort.dir === 'asc'
              ? 1
              : -1
            : dateA === dateB
            ? 0

            : qsState.sort.dir === 'asc'
            ? -1
            : 1
        case 'c':
          const yearA = getYear(a)
          const yearB = getYear(b)
          return yearA > yearB
            ? qsState.sort.dir === 'asc'
              ? 1
              : -1
            : yearA === yearB
            ? 0

            : qsState.sort.dir === 'asc'
            ? -1
            : 1
        case 't':
          const titleA = normalizeString(a.title.translations[a.title.main])
          const titleB = normalizeString(b.title.translations[b.title.main])
          return titleA > titleB
            ? qsState.sort.dir === 'desc'
              ? -1
              : 1
            : titleA === titleB
            ? 0

            : qsState.sort.dir === 'asc'
            ? 1
            : -1
        case 'd':
          const durationA = getDuration(a)
          const durationB = getDuration(b)
          return durationA > durationB
            ? qsState.sort.dir === 'asc'
              ? 1
              : -1
            : durationA === durationB
            ? 0

            : qsState.sort.dir === 'asc'
            ? -1
            : 1
      }
    })
  }

  function handleQuery({ index, query, works }) {
    if ((query || '').startsWith('id:')) {
      return works.filter(work => work.id === query.split(':')[1])
    } else {
      if (!index.search) {
        return works
      }

      const results = index.search(query || '')
      const r = results.map(result => result.ref)
      return works.filter(work => r.includes(work.id))
    }
  }

  function handleFacets({ activeFacets, works }) {
    return activeFacets.length
      ? works.filter(work =>
          activeFacets.every(facet => work.facets.includes(facet))
        )
      : works
  }

  function refine(facet) {
    qsState = {
      ...qsState,
      activeFacets: qsState.activeFacets.includes(facet)
        ? qsState.activeFacets.filter(f => f !== facet)
        : [...qsState.activeFacets, facet]
    }
  }

  function clear() {
    qsState = { ...defaultQsState }
  }

  function onSort(item) {
    qsState.sort = item
  }

  function toggleReworks(workId) {
    qsState = {
      ...qsState,
      reworksOf: qsState.reworksOf === workId ? '' : workId
    }
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
          <Sort {qsState} onSort={onSort} />
        {/if}
        {#await loadCatalogue()}
          <div class="catalogue--loader">
            <Spinner size={20} radius={8} stroke={2.5} />
            <p>Loading catalogue data</p>
          </div>
        {:then}
          <WorkList
            catalogue={data.catalogue}
            {embedded}
            fields={data.catalogue.fields}
            fullList={works}
            filteredList={results}
            i18n={data.i18n}
            publishers={data.catalogue.publishers}
            {qsState}
            onRefine={refine}
            onToggleReworks={toggleReworks}
          />
        {:catch error}
          <p>
            Failed to initialize catalogue: <strong>{error.message}</strong>.
          </p>
          {console.error(error)}
        {/await}
      </div>
      {#if !embedded}
        <div class="column refine">
          <Refine
            activeFacets={qsState.activeFacets}
            categories={data.catalogue?.categories}
            genres={data.catalogue?.genres}
            publishers={data.catalogue?.publishers}
            {loadSearchIndex}
            {qsState}
            works={results}
            onUpdateQuery={value => qsState.query = value}
            onRefine={refine}
            onClear={clear}
          />
        </div>
      {/if}
    </div>
    <Pagination />
  </div>
</form>

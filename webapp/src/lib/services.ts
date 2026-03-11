// services.ts
import {
  type CatalogueDataResponse,
  type EndpointKey,
  type FilteredWork,
  type QsSort,
  type QsState,
  type ActiveFacetTuple,
  type FacetGroup,
  type QsSortDir,
  QS_SORT_FIELDS,
  type QsSortField,
  FACET_GROUPS
} from '../types'
import { ENDPOINTS } from './config'

export const catalogue = {
  _normalizeString: (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  },

  filterWorks: ({
    activeFacets,
    query,
    reworksOf,
    sort,
    searchIndex,
    works,
    embedded
  }: {
    activeFacets: ActiveFacetTuple[]
    query: string
    reworksOf: string
    sort: QsSort
    searchIndex: any
    works: FilteredWork[]
    embedded: boolean
  }): FilteredWork[] => {

    let results = [...works]

    // 1. Filter by rework context (single work mode)
    if (reworksOf) {
      results = works.filter(w => w.id === reworksOf || w.rework === reworksOf)
    } else {
      // 2. Filter by Search Query
      if (query) {
        if (query.startsWith('id:')) {
          const id = query.split(':')[1]
          results = results.filter(w => w.id === id)
        } else if (searchIndex?.search) {
          const lunrResults = searchIndex.search(query)
          const ids = new Set(lunrResults.map((r: any) => r.ref))
          results = results.filter(w => ids.has(w.id))
        }
      }

      // 3. Filter by Active Facets
      if (activeFacets.length > 0) {
        // Convert tuples back to "group.value" strings for comparison
        const activeStrings = activeFacets.map(([g, v]) => `${g}.${v}`)

        results = results.filter(work =>
          // A work must match ALL active facets (AND logic)
          activeStrings.every(f => work.facets.includes(f))
        )
      }
    }

    // 4. Sorting
    if (embedded || reworksOf) {
      return results.sort(a => (a.id === reworksOf ? -1 : 1))
    }

    return results.sort((a, b) => {
      const dirMult = sort.dir === 'asc' ? 1 : -1

      switch (sort.field) {
        case 'u': { // Update Date
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return (dateA - dateB) * dirMult
        }
        case 'c': { // Composition Date
          const yearA = parseInt(String(a.composition_date || 1900).substr(0, 4))
          const yearB = parseInt(String(b.composition_date || 1900).substr(0, 4))
          return (yearA - yearB) * dirMult
        }
        case 't': { // Title
          const titleA = catalogue._normalizeString(a.title.main)
          const titleB = catalogue._normalizeString(b.title.main)
          return titleA.localeCompare(titleB) * dirMult
        }
        case 'd': { // Duration
          const durA = a.duration || 0
          const durB = b.duration || 0
          return (durA - durB) * dirMult
        }
        default: return 0
      }
    })
  }
}

export const data = {
  getCatalogueData: async (): Promise<CatalogueDataResponse> => {
    const endpoints = Object.entries(ENDPOINTS).filter(([k]) => k !== 'index') as [EndpointKey, string][]

    const responses = await Promise.all(
      endpoints.map(([key, url]) =>
        fetch(url).then(res => res.json()).then(data => ({ key, data }))
      )
    )

    const result: any = {}
    responses.forEach(({ key, data }) => result[key] = data)
    return result as CatalogueDataResponse
  },

  getIndexData: async () => {
    try {
      const res = await fetch(ENDPOINTS.index)
      if (!res.ok) throw new Error('Failed to fetch index')
      return await res.json()
    } catch (e) {
      console.error('Index load error:', e)
      return null
    }
  }
}

export const qs = {
  defaultState: {
    activeFacets: [],
    page: 1,
    query: '',
    reworksOf: '',
    showID: false,
    sort: { field: 't', dir: 'asc' },
  } as QsState,

  /**
   * Parses URL param string to ActiveFacetTuple[]
   */
  _parseFacets: (param: string | null): ActiveFacetTuple[] => {
    if (!param) {
      return []
    }

    return param.split(',')
      .map(item => {
        const parts = item.trim().split('.')

        if (parts.length !== 2) {
          return null
        }

        const potentialGroup = parts[0]
        const value = parts[1]

        // Use shared constant to validate the group
        if (!FACET_GROUPS.includes(potentialGroup as FacetGroup)) {
          return null
        }

        // If valid, explicitly construct the tuple
        const group = potentialGroup as FacetGroup
        return [group, value] as ActiveFacetTuple
      })
      .filter((item): item is ActiveFacetTuple => {
        return item !== null
      })
  },

  /**
   * Serializes ActiveFacetTuple[] to URL string
   */
  _serializeFacets: (facets: ActiveFacetTuple[]): string | undefined => {
    if (!facets.length) {
      return undefined
    }
    return facets.map(([g, v]) => `${g}.${v}`).join(',')
  },

  load: (workId?: string): QsState => {
    const params = new URLSearchParams(window.location.search)

    // Parse Sort with safe default values
    let sort: QsSort = { field: 't', dir: 'asc' }
    const sParam = params.get('s')

    if (sParam) {
      const parts = sParam.split('.')
      const fieldPart = parts[0]
      const dirPart = parts[1]

      if (QS_SORT_FIELDS.includes(fieldPart as QsSortField)) {
        sort.field = fieldPart as QsSortField
      }

      if (dirPart === 'asc' || dirPart === 'desc') {
        sort.dir = dirPart as QsSortDir
      }
    }

    const fParam = params.get('f')
    const pParam = params.get('p')
    const qParam = params.get('q')
    const rParam = params.get('r')

    return {
      activeFacets: qs._parseFacets(fParam),
      page: pParam ? parseInt(pParam, 10) : 1,
      query: workId ? `id:${workId}` : (qParam || ''),
      reworksOf: workId || (rParam || ''),
      showID: params.has('showID'),
      sort
    }
  },

  sync: (state: QsState) => {
    const params = new URLSearchParams()

    if (state.query) {
      params.set('q', state.query)
    }

    const fStr = qs._serializeFacets(state.activeFacets)
    if (fStr) {
      params.set('f', fStr)
    }

    if (state.reworksOf) {
      params.set('r', state.reworksOf)
    }

    if (state.showID) {
      params.set('showID', '')
    }

    params.set('s', `${state.sort.field}.${state.sort.dir}`)

    if (state.page > 1) {
      params.set('p', state.page.toString())
    }

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    window.history.replaceState(null, '', newUrl)
  }
}

export const cms = {
  customizeSection: (appContainerId: string) => {
    const el = document.getElementById(appContainerId)
    const section = el?.closest('section')

    if (section) {
      (section as HTMLElement).style.overflow = 'hidden'
    }
  }
}

export const scroll = {
  refine: null as HTMLElement | null,
  inner: null as HTMLElement | null,
  list: null as HTMLElement | null,

  initScrollBehaviors: (app: HTMLElement) => {
    setTimeout(() => {
      scroll.refine = app.querySelector<HTMLElement>('.refine--wrapper')
      scroll.inner = app.querySelector<HTMLElement>('.refine--inner')
      scroll.list = app.querySelector<HTMLElement>('.works--list')
    }, 100)

    window.addEventListener('scroll', scroll.stickRefinePanel, { passive: true })
    window.addEventListener('resize', scroll.stickRefinePanel, { passive: true })
  },

  stickRefinePanel: () => {
    if (!scroll.refine || !scroll.list || !scroll.inner) {
      return
    }

    const innerRect = scroll.inner.getBoundingClientRect()
    const listRect = scroll.list.getBoundingClientRect()

    if (listRect.top > 0) {
      scroll.refine.classList.remove('sticked', 'scrolled')
    } else if (listRect.bottom >= innerRect.height) {
      scroll.refine.classList.add('sticked')
      scroll.refine.classList.remove('scrolled')
    } else {
      scroll.refine.classList.add('scrolled')
      scroll.refine.classList.remove('sticked')
    }
  }
}
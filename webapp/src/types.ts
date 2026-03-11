declare global {
  interface Window {
    lunr: any
  }
}

// --- Endpoints ---
export type EndpointKey = 'catalogue' | 'i18n' | 'index'
export type Endpoints = Record<EndpointKey, string>

// --- Catalogue Data ---
export type Category = {
  genre: string
  tag: string
  title: string
}

export type Genre = {
  tag: string
  title: string
}

export type Publisher = {
  name: string
  url: string
  shortName?: string // Ajouté car utilisé dans config.ts
}

export type Audio = {
  cd: string
  description: string
  id: string
  track: number
}

export type Movement = {
  title: string
  duration?: number
}

export type Publication = {
  downloadable?: boolean
  publisher_id?: string
  download?: boolean // TODO: should we keep .downlaod (cf config.ts) or .downloadable (cf c.json)
}

export type Score = {
  size: string
  type: string
  url: string
}

export type WorldPremiere = {
  credits: string[]
  date: number
  location: string
}

export type Cast = {
  role: string
  voice?: string
}

export type Work = {
  audios?: Audio[]
  cast: Cast[]
  category: string
  composition_date?: number | string
  date: Date | string
  dedicated?: string
  description?: string
  duration?: number
  genre: string
  id: string
  libretto?: Record<string, string>
  movements?: Movement[]
  note?: string
  publications?: Publication[]
  rework?: string
  rework_of?: string
  scores?: Score[]
  story?: string
  texts?: Record<string, string>
  title: {
    main: string
    original: string
    sort: string[]
    translations: Record<string, string>
  }
  world_premiere: WorldPremiere
}

export type FilteredWork = Work & {
  facets: string[] // serialized format: "g.vocal"
}

export type RenderedWork = Work & FilteredWork & { visible: boolean, order: number, index: number }

export type Catalogue = {
  categories: Record<string, Category>
  fields: string[]
  genres: Record<string, Genre>
  publishers: Record<string, Publisher>
  works: Work[]
}

export type CatalogueDataResponse = {
  catalogue: Catalogue
  i18n: I18n
}

// --- I18n ---
export type I18n = {
  fields: Record<string, string>
  score_type: Record<string, string>
}

// --- Facets ---
export const FACET_GROUPS = [
  'c', // categories
  'd', // composition decennies
  'g', // genres
  'l', // languages
  'm', // multimedia
  'p', // publishers
  't'  // durations
] as const

export type FacetGroup = typeof FACET_GROUPS[number]

export type DurationRangeKey =
  | 'lt2'     // lower than 2 minutes
  | 'f2t5'    // from 2 to 5 minutes
  | 'f5t15'   // from 5 to 15 minutes
  | 'f15t30'  // from 15 to 30 minutes
  | 'f30t1h'  // from 30 minutes to 1 hour
  | 'f1ht2h'  // from 1 to 2 hours
  | 'gt2h'    // greater than 2 hours

export type DurationRange = {
  [K in DurationRangeKey]: {
    label: string
    compute: (duration: number) => boolean
  }
}

export type ActiveFacetTuple = [FacetGroup, string]

export type GenreMap = Record<string, Genre>
export type CategoryMap = Record<string, Category>
export type PublisherMap = Record<string, Publisher>

export type FacetContext = {
  value: string
  genres?: GenreMap
  categories?: CategoryMap
  publishers?: PublisherMap
}

export type Facet = {
  order: number
  collapsed: boolean
  label: string
  getValues: (work: Work) => string[]
  getLabel: (context: FacetContext) => string | undefined
}

export type FacetMap = Record<FacetGroup, Facet>

export type GroupedFacetItem = {
  count: number
  value: string
  active: boolean
  label: string
}

export type GroupedFacetMap = Record<string, GroupedFacetItem>

export type GroupedFacetDefinition = {
  collapsed: boolean
  label: string
  facets: GroupedFacetMap
}

export type GroupedFacet = {
  group: FacetGroup
  def: GroupedFacetDefinition
}

// --- Query String ---
export const QS_SORT_FIELDS = [
  't', // title
  'u', // update date
  'd', // duration
  'c'  // composition_date
] as const;

export type QsParams = {
  f?: string | string[]
  p?: number
  q?: string
  r?: string
  s?: string
  showID?: boolean
}

export type QsSortField = typeof QS_SORT_FIELDS[number];
export type QsSortDir = 'asc' | 'desc'

export type QsSort = {
  field: QsSortField
  dir: QsSortDir
}

export type QsState = {
  activeFacets: ActiveFacetTuple[] // facet filters
  page: number, // page number
  query: string, // lunr search query
  reworksOf: string, // reworks for given work id
  showID: boolean, // shows work ID
  sort: QsSort, // results' sort order
}
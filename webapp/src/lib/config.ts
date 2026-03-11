import { type DurationRange, type DurationRangeKey, type Endpoints, type FacetMap, type Work } from '../types'

export const APP_CONTAINER_ID = 'catalogue-app'

export const ENDPOINTS: Endpoints = {
  catalogue: '/_catalogue/c.json',
  index: '/_catalogue/i.json',
  i18n: '/_catalogue/i18n/en.json',
}

export const DURATION_RANGES: DurationRange = {
  lt2: {
    label: '< 2′ ',
    compute: (duration: number) => duration < 120
  },
  f2t5: {
    label: '2′ – 5′',
    compute: (duration: number) => duration >= 120 && duration < 300
  },
  f5t15: {
    label: '5′ – 15′',
    compute: (duration: number) => duration >= 300 && duration < 900
  },
  f15t30: {
    label: '15′ – 30′',
    compute: (duration: number) => duration >= 900 && duration < 1800
  },
  f30t1h: {
    label: '30′ – 1h',
    compute: (duration: number) => duration >= 1800 && duration < 3600
  },
  f1ht2h: {
    label: '1h – 2h',
    compute: (duration: number) => duration >= 3600 && duration <= 7200
  },
  gt2h: {
    label: '> 2h',
    compute: (duration: number) => duration > 7200
  }
}

export const FACETS: FacetMap = {
  m: {
    order: 1,
    collapsed: true,
    label: 'Multimedia',
    getValues: (work: Work) => {
      const res: string[] = []
      if (work.audios) res.push('audios')
      if (work.scores) res.push('scores')
      if (work.story) res.push('stories')
      return res
    },
    getLabel: ({ value }) => {
      switch (value) {
        case 'audios': return 'With audio'
        case 'scores': return 'With scores'
        case 'stories': return 'With story'
        default: return value
      }
    }
  },
  g: {
    order: 2,
    collapsed: false,
    label: 'Genres',
    getValues: (work: Work) => [work.genre],
    getLabel: ({ value, genres = {} }) => genres[value]?.title
  },
  c: {
    order: 3,
    collapsed: false,
    label: 'Categories',
    getValues: (work: Work) => [work.category],
    getLabel: ({ value, categories = {} }) => categories[value]?.title
  },
  l: {
    order: 4,
    collapsed: true,
    label: 'Languages',
    getValues: (work: Work) => {
      const texts = work.texts || {}
      const libretto = work.libretto || {}
      return Object.keys({ ...texts, ...libretto })
    },
    getLabel: ({ value }) => value.toUpperCase()
  },
  p: {
    order: 5,
    collapsed: true,
    label: 'Publishers',
    getValues: (work: Work) => {
      if (!work.publications) return ['unpublished']

      return work.publications.reduce((grouped, publication) => {
        if (publication.downloadable || publication.download) {
          return grouped
        }
        const id = publication.publisher_id
        if (id && !grouped.includes(id)) {
          grouped.push(id)
        }
        return grouped
      }, [] as string[])
    },
    getLabel: ({ value, publishers = {} }) => {
      if (value === 'unpublished') {
        return 'Unpublished'
      }

      const pub = publishers[value]
      return pub?.shortName || pub?.name || value
    }
  },
  t: {
    order: 6,
    collapsed: true,
    label: 'Durations',
    getValues: (work: Work) => {
      if (!work.duration) return []
      return Object.entries(DURATION_RANGES)
        .filter(([_, { compute }]) => compute(work.duration!))
        .map(([id]) => id)
    },
    getLabel: ({ value }) => DURATION_RANGES[value as DurationRangeKey]?.label || value
  },
  d: {
    order: 7,
    collapsed: true,
    label: 'Composition decennies',
    getValues: (work: Work) => {
      const dateStr = work.composition_date?.toString() || ''
      const r = /(19|20)\d{2}/gmi
      let m
      const matches: string[] = []

      while ((m = r.exec(dateStr)) !== null) {
        if (m.index === r.lastIndex) r.lastIndex++
        matches.push(m[0])
      }

      return matches.reduce((unique, year) => {
        let y = parseInt(year)
        if (y % 10 === 0) y -= 1

        const d = Math.floor((y % 1900) / 10)
        let decenny = ''

        if (d > 10) {
          decenny = `20${d}1 - 20${d+1}0`
        } else if (d === 9) {
          decenny = `19${d}1 - 2001`
        } else {
          decenny = `19${d}1 - 19${d+1}0`
        }

        const finalLabel = decenny.substr(0, 3) + '0s'
        if (!unique.includes(finalLabel)) unique.push(finalLabel)
        return unique
      }, [] as string[])
    },
    getLabel: ({ value }) => {
      const startYear = parseInt(value.substr(0, 4))
      return `${startYear + 1} - ${startYear + 10}`
    }
  }
}
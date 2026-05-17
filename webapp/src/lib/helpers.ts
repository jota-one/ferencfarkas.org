import {
  type Work,
  type FacetGroup,
  type ActiveFacetTuple,
  type GenreMap,
  type CategoryMap,
  type PublisherMap,
  type FilteredWork,
  FACET_GROUPS,
  type GroupedFacet
} from '../types'
import { FACETS } from './config'

export const format = {
  formatDuration: (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds - h * 3600) / 60)
    const s = Math.floor(seconds - h * 3600 - m * 60)

    let str = ''
    if (h > 0) str += `${h}h `
    if (m > 0) str += `${m}′ `
    if (s > 0) str += `${s}″`
    return str
  },

  formatDate: (date: Date | string): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

export const facets = {
  /**
   * Serializes a tuple [group, value] into a string "group.value"
   */
  serialize: (group: FacetGroup, value: string): string => {
    return `${group}.${value}`
  },

  /**
   * Parses a string "group.value" back into an ActiveFacetTuple
   * Returns undefined if the format is invalid or the group is unknown
   */
  deserialize: (serialized: string): ActiveFacetTuple | undefined => {
    const parts = serialized.split('.')

    if (parts.length !== 2) {
      return undefined
    }

    const potentialGroup = parts[0]
    const value = parts[1]

    // Dynamic check: does this string exist in our constant?
    if (!FACET_GROUPS.includes(potentialGroup as FacetGroup)) {
      return undefined
    }

    // If we reach here, TypeScript knows potentialGroup is a valid FacetGroup
    const group = potentialGroup as FacetGroup

    // Ensure value is not empty
    if (!value) {
      return undefined
    }

    return [group, value]
  },

  /**
   * Computes and attaches serialized facet strings to each work
   */
  setFacets: (works: Work[]): FilteredWork[] => {
    const result: FilteredWork[] = []
    const groups = Object.keys(FACETS) as FacetGroup[]

    for (const work of works) {
      const computedFacets: string[] = []

      for (const group of groups) {
        const def = FACETS[group]
        const values = def.getValues(work)

        for (const val of values) {
          computedFacets.push(facets.serialize(group, val))
        }
      }

      result.push({
        ...work,
        facets: computedFacets
      })
    }

    return result
  },

  /**
   * Calculates facet counts and active states for the UI
   */
  getFacets: ({
    activeFacets,
    categories,
    genres,
    publishers,
    works
  }: {
    activeFacets: ActiveFacetTuple[]
    categories: CategoryMap
    genres: GenreMap
    publishers: PublisherMap
    works: FilteredWork[]
  }): GroupedFacet[] => {

    // 1. Count occurrences of each serialized facet key
    const counts: Record<string, number> = {}

    for (const work of works) {
      for (const key of work.facets) {
        counts[key] = (counts[key] || 0) + 1
      }
    }

    // 2. Build the hierarchical structure
    const output: GroupedFacet[] = []
    const groups = Object.keys(FACETS) as FacetGroup[]

    for (const group of groups) {
      const def = FACETS[group]
      const groupFacets: Record<string, { count: number, value: string, active: boolean, label: string }> = {}

      // Check which counts belong to this group
      for (const [serializedKey, count] of Object.entries(counts)) {
        const parsed = facets.deserialize(serializedKey)

        // Skip if invalid or not belonging to current group
        if (!parsed || parsed[0] !== group) {
          continue
        }

        const value = parsed[1]

        // Check if this specific facet is currently active
        const isActive = activeFacets.some(
          ([actGroup, actVal]) => actGroup === group && actVal === value
        )

        // Get the human-readable label
        const label = def.getLabel({ value, genres, categories, publishers }) || value

        groupFacets[value] = {
          count,
          value,
          active: isActive,
          label
        }
      }

      // Only add the group if it has visible facets
      if (Object.keys(groupFacets).length > 0) {
        output.push({
          group,
          def: {
            collapsed: def.collapsed,
            label: def.label,
            facets: groupFacets
          }
        })
      }
    }

    // Sort by defined order
    return output.sort((a, b) => FACETS[a.group].order - FACETS[b.group].order)
  }
}
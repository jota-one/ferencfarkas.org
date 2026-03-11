<script lang="ts">
  import type { Category, FilteredWork, I18n, Publisher, QsState, RenderedWork } from '../../types'
  import { mount } from 'svelte'
  import { facets as facetsHelper } from '../helpers'
  import WorkComponent from './Work.svelte'
  import WorkFields from './WorkFields.svelte'

  type Props = {
    categories?: Record<string, Category>
    embedded: boolean
    i18n?: I18n
    fields?: string[]
    filteredList?: FilteredWork[]
    fullList?: RenderedWork[]
    publishers?: Record<string, Publisher>
    qsState: QsState
    onRefine: (serializedFacet: string) => void
    onToggleReworks: (workId: string) => void
  }

  let {
    categories,
    embedded = false,
    i18n,
    fields = [],
    filteredList = [],
    fullList = [],
    publishers = {},
    qsState,
    onRefine,
    onToggleReworks,
  }: Props = $props()

  let works = $state<RenderedWork[]>([])

  let reworkActive = $derived((qsState.reworksOf && filteredList.length > 1) || undefined)
  let reworkTitle = $derived(getReworkTitle(qsState.reworksOf))

  $effect(() => {
    updateWorks(fullList, filteredList)
  })

  function getReworkTitle(reworksOf: string) {
    if (!reworksOf) {
      return
    }

    const work = works.find(work => work.id === reworksOf)
    return work?.title?.translations[work.title?.main]
  }

  const updateWorks = (fullList: RenderedWork[], filteredList: FilteredWork[]) => {
    console.log('updateWorks', filteredList.length)
    const list = [... works.length ? works : fullList]

    for (let i = 0; i < list.length; i++) {
      const order = filteredList.findIndex(item => item.id === list[i]?.id)
      const visible = order > -1
      const workItem = list[i]

      if (!workItem) {
        continue
      }

      workItem.visible = visible
      workItem.order = order
    }

    if (!works.length) {
      works = [...fullList]
    } else {
      for (let i = 0; i < works.length; i++) {
        const work = works[i]

        if (!work) {
          continue
        }

        const workEl = document.getElementById(work.id)

        if (!workEl) {
          continue
        }

        workEl.style.order = work.order.toString()

        if (work.visible) {
          workEl.classList.remove('hidden')
        } else {
          workEl.classList.add('hidden')
        }
      }
    }
  }

  const onClick = (event: MouseEvent) => {
    const caller = event.target as HTMLElement
    let workEl = caller

    while (!workEl.id) {
      workEl = workEl.parentNode as HTMLElement
    }

    const workId = workEl.id
    const work = works.find(w => w.id === workId)

    if (!work) {
      return
    }

    const facets = work.facets.reduce((facets, facet) => {
      const [ group, value ] = facetsHelper.deserialize(facet) || []

      if (group) {
        facets[group] = value
      }

      return facets
    }, {})

    if (caller === workEl) {
      navigator.clipboard.writeText(work.id)
    }

    if (caller.classList.contains('work--composition-date')) {
      onRefine(facetsHelper.serialize('d', facets.d))
    }

    if (caller.classList.contains('work--duration')) {
      onRefine(facetsHelper.serialize('t', facets.t))
    }

    if (
      caller.classList.contains('rework') ||
      caller.classList.contains('reworked')
    ) {
      onToggleReworks(work.rework || work.id)
    }

    if (caller.classList.contains('category')) {
      onRefine(facetsHelper.serialize('c', facets.c))
    }

    if (caller.classList.contains('work--language')) {
      onRefine(facetsHelper.serialize('l', facets.l))
    }

    if (caller.classList.contains('play')) {
      window.dispatchEvent(
        new window.CustomEvent('play', {
          detail: { target: caller, audio: caller.getAttribute('data-audio') },
        })
      )
    }

    if (caller.classList.contains('work--story')) {
    }

    if (caller.classList.contains('work--detail-toogle')) {
      const fieldsEl = workEl.querySelector('dl')

      if (fieldsEl) {
        fieldsEl.remove()
        workEl.classList.remove('show-fields')
      } else {
        workEl.classList.add('show-fields')

        if (!work) {
          return
        }

        mount(WorkFields, {
          target: workEl,
          anchor: caller,
          props: {
            fields,
            i18n,
            publishers,
            work
          },
        })
      }
    }
  }
</script>

{#if !embedded && reworkActive}
  <div class="works--rework-info" class:visible={reworkActive}>
    <p>
      You are seeing the list of works that have been reworked based on
      <strong>{reworkTitle}</strong>.
      <br />
      You can go
      <button
        class="link back"
        onclick={e => {
          e.stopPropagation()
          onToggleReworks(qsState.reworksOf)
        }}
        >back to the previous list</button
      > by clicking ony any of the "Rework" / "Reworked" buttons.
    </p>
  </div>
{/if}

{#if embedded && !reworkActive}
  <br />
{/if}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<ul
  class="works--list"
  class:show-id={qsState.showID}
  class:show-reworks={reworkActive}
  onclick={onClick}
>
  <li class="reworks-sep">Reworks</li>
  {#each works as work (work.id)}
    <WorkComponent
      categories={categories}
      index={(work as RenderedWork).index}
      work={work as RenderedWork}
      {embedded}
      {reworkActive}
      {i18n}
    />
  {/each}
</ul>

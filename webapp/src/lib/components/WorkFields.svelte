<script lang="ts">
  import type { Cast, I18n, Movement, Publication, Publisher, RenderedWork, WorldPremiere } from '../../types'
  import { format as formatHelper } from '../helpers'

  type Props = {
    fields: string[]
    i18n: I18n
    publishers: Record<string, Publisher>
    work: RenderedWork
  }

  let {
    fields = [],
    i18n,
    publishers,
    work
  }: Props = $props()

  const SKIP_WORK_KEYS = [
    'audios',
    'category',
    'composition_date',
    'default',
    'description',
    'duration',
    'facets',
    'filtered',
    'genre',
    'id',
    'isDefaultVersion',
    'lastUpdate',
    'order',
    'rework',
    'rework_of',
    'scores',
    'story',
    'title',
    'versions',
    'visible',
    'works',
  ]

  const workFields = $derived(Object.entries(work)
    .filter(([key]) => !SKIP_WORK_KEYS.includes(key))
    .sort((a, b) => {
      const posA = fields.indexOf(a[0])
      const posB = fields.indexOf(b[0])
      return posA > posB ? 1 : posA < posB ? -1 : 0
    })
    .map(([key, value]) => ({ key, value })))

  const getWorldPremiere = (worldPremiere: WorldPremiere) => {
    let dateLocation = []

    if (worldPremiere.date) {
      let date = worldPremiere.date.toString()

      if (worldPremiere.date.toString().includes('T')) {
        date = formatHelper.formatDate(date)
      }

      dateLocation.push(date)
    }

    if (location) {
      dateLocation.push(location)
    }

    return dateLocation.join(' - ')
  }
</script>

<dl>
  {#each workFields as { key, value }}
    <dt>{i18n.fields[key] || key}</dt>
    <dd>
      {#if key === 'cast'}
        <ul>
          {#each (value as Cast[]) as { role, voice }}
            <li>
              {role}
              {#if voice}
                - <em>{voice}</em>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if key === 'duration'}
        {formatHelper.formatDuration(value as number)}
      {:else if key === 'libretto' || key === 'texts'}
        <ul>
          {#each Object.values(value) as item}
            <li>{item}</li>
          {/each}
        </ul>
      {:else if key === 'movements'}
        <ul class="movements">
          {#each (value as Movement[]) as movement, index}
            <li class="movement">
              <span class="movement--pos">{index + 1})</span>
              <span class="movement--title">{movement.title}</span>
              {#if movement.duration}
                <span class="movement--duration">
                  {formatHelper.formatDuration(movement.duration)}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if key === 'publications'}
        <ul>
          {#each (value as Publication[]) as publication}
            <li>
              <!-- {#if publication.type && work.publications?.some(p => !p.downloadable)}
                <em>
                  {#if i18n.score_type[publication.type]}
                    {i18n.score_type[publication.type]}:
                  {:else}
                    {publication.type}:
                  {/if}
                </em>
              {/if} -->
              {#if publication.downloadable}
                Free download
              {:else if publication.publisher_id && publishers[publication.publisher_id]?.url}
                {@const publisherUrl = publishers[publication.publisher_id]?.url}
                {@const publisherName = publishers[publication.publisher_id]?.name}
                <a
                  href={publisherUrl}
                  class="link"
                  target="_blank"
                >
                  {publisherName}
                </a>
              {:else}
                {publication.publisher_id && publishers[publication.publisher_id]?.name}
                <div class="work-input">
                  Do you have info about this publisher?
                  <br />
                  <a
                    href="/contact?publisher={publication.publisher_id}"
                    target="_blank"
                    class="button"
                    onclick={e => e.stopPropagation()}
                  >
                    Please let us know!
                  </a>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if key === 'world_premiere'}
        {@const worldPremiere = value as WorldPremiere}
        {#if worldPremiere.credits}
          <ul>
            <li>{getWorldPremiere(worldPremiere)}</li>
            {#each (worldPremiere).credits as credit}
              <li>{credit}</li>
            {/each}
          </ul>
        {:else}
          {getWorldPremiere(worldPremiere)}
        {/if}
      {:else if key === 'date'}
        {formatHelper.formatDate(value as string)}
      {:else if key === 'nb'}
        {@html value}
      {:else}
        {value || '-'}
      {/if}
    </dd>
  {/each}
</dl>

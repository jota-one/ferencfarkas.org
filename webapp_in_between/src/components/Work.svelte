<script>
  import { formatDuration } from '../helpers/format'

  let {
    categories = {},
    embedded = false,
    index = -1,
    reworkActive = false,
    work = {},
    i18n = {},
  } = $props()

  const isRework = $derived(work.rework !== work.id)
  const reworked = $derived(reworkActive && !isRework)
</script>

<li
  id={work.id}
  data-index={index}
  class:hidden={!work.visible}
  style="order: {work.order}"
>
  <header>
    <div class="work--meta">
      <!-- Composition date -->
      <button class="work--composition-date">
        {work?.composition_date || '-'}
      </button>

      <!-- Duration -->
      <button class="work--duration">
        {work.duration ? formatDuration(work.duration) : '-'}
      </button>

      <!-- Rework -->
      {#if work.rework}
        <button
          class="tag border rework{isRework ? '' : 'ed'}"
          class:active={reworkActive}
        >
          {#if reworked}
            Reworked
          {:else}
            Rework{isRework ? '' : 'ed'}
          {/if}
        </button>
      {/if}
    </div>

    <!-- Category -->
    {#if work.category}
      <button class="tag category">
        {categories[work.category].tag}
      </button>
    {/if}
  </header>

  <!-- Title -->
  {#if work.title}
    <h3 class="work--title">
      {work.title?.translations[work.title?.main]}
      {#if work.texts || work.libretto}
        &nbsp;
        {#each Object.keys({ ...work.texts, ...work.libretto }) as lang}
          <button class="work--language">{lang}</button>
        {/each}
      {/if}
    </h3>
    {#if work.title.sort.length > 1}
      <h4>
        {work.title.sort
          .filter(lang => lang !== work.title.main)
          .map(lang => work.title.translations[lang])
          .join(' / ')}
      </h4>
    {/if}
  {/if}

  <!-- Description -->
  {#if work.description}
    <h5>
      {work.description}
      {#if work.note}
        <div class="work--note">{work.note}</div>
      {/if}
    </h5>
  {/if}

  <!-- Story -->
  {#if work.story && !embedded}
    <a class="more" href={work.story}> About the work </a>
  {/if}

  <!-- Multimedia -->
  {#if work.audios || work.scores}
    <div class="work--multimedia">
      <!-- Audios -->
      {#if work.audios}
        <div class="work--audios">
          {#each work.audios as audio}
            <button
              class="play small"
              data-audio={audio.id}
              data-title={audio.description}
            >
              <div class="play--button"></div>
              <h5>{audio.description}</h5>
            </button>
          {/each}
        </div>
      {/if}
      <!-- Scores -->
      {#if work.scores}
        <span class="spacer"></span>
        <div class="work--scores">
          <button onclick={e => {
            console.log('parentElement', e.target.parentElement)
            e.target.parentElement.classList.toggle('hover')}
          }>
            Scores
            <span class="facet--count">
              {work.scores.length}
            </span>
          </button>
          <div class="work--scores-links">
            {#each work.scores as score}
              <a href="{score.url}" target="_blank">
                {#if score.type}
                  {i18n.score_type[score.type]}
                {/if}
                <span class="file-size">
                  {score.size}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Toggle details -->
  <button class="work--detail-toogle" aria-label="Toggle details"></button>
</li>

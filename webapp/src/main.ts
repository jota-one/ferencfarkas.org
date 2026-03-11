import { mount } from 'svelte'
import App from './App.svelte'
import { APP_CONTAINER_ID } from './lib/config'

const target = document.getElementById(APP_CONTAINER_ID) as HTMLElement

const app = mount(App, {
  target,
  props: {
    workId: target.getAttribute('data-work-id') || undefined
  }
})

export default app

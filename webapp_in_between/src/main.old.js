import { mount } from 'svelte'
import App from './App2.svelte'

const target = document.getElementById('catalogue-app')

const app = mount(App, {
  target,
  props: {
    workId: target.getAttribute('data-work-id')
  }
})

export default app

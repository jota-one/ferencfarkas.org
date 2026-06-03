import { mount } from 'svelte'
import App from './App.svelte'
import { APP_CONTAINER_ID } from './lib/config'
import Flickity from 'flickity'
import 'flickity/dist/flickity.css'
import WaveSurfer from 'wavesurfer.js'

window.Flickity = Flickity
window.WaveSurfer = WaveSurfer

const target = document.getElementById(APP_CONTAINER_ID)

if (target) {
  mount(App, {
    target,
    props: {
      workId: target.getAttribute('data-work-id') || undefined
    }
  })
}

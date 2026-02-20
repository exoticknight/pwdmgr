import { mount } from 'svelte'

import App from './app.svelte'

import './global.css'

import './i18n'

// 开发环境保留右键，生产环境禁用
if (!import.meta.env.DEV) {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

const app = mount(App, { target: document.getElementById('app')! })

export default app

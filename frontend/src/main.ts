import { mount } from 'svelte'
import App from './app.svelte'
import './global.css'
import './i18n'

// 禁用右键菜单（双重保护，Wails 后端也已禁用）
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

const app = mount(App, { target: document.getElementById('app')! })

export default app

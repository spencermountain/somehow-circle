import App from './App.svelte'

let user = ''
// wire-in query params
const URLSearchParams = window.URLSearchParams
if (typeof URLSearchParams !== undefined) {
  const urlParams = new URLSearchParams(window.location.search)
  const myParam = urlParams.get('user')
  if (myParam) {
    user = myParam
  }
}

const app = new App({
  target: document.body,
  props: { user: user }
})

export default app

/* Registra rutas y busca cual coincide con el hash */
const routes = []

export function addRoute(path, handler) {
  routes.push({ path, handler })
}

function matchRoute(hashPath) {
  const clean = hashPath.replace(/^#/, '') || '/'
  const pathOnly = clean.split('?')[0]

  for (const route of routes) {
    const names = []
    const pattern = route.path
      .replace(/\//g, '\\/')
      .replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
        names.push(name)
        return '([^/]+)'
      })
/* Arma la expresion regular de la ruta */
    const regex = new RegExp(`^${pattern}$`)
    const match = pathOnly.match(regex)

    if (match) {
      const params = {}
      names.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1])
      })
      return { handler: route.handler, params, path: pathOnly }
    }
  }

  return null
}

export function navigate(path) {
  const next = path.startsWith('#') ? path : `#${path}`
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}
/* Arranca el router y escucha cambios de hash*/
export function startRouter(root) {
  async function render() {
    const matched = matchRoute(window.location.hash || '#/')

    if (!matched) {
      root.innerHTML = `
        <div class="vf-page min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-3">404</h1>
            <p class="text-[var(--vf-muted)] mb-4">Pagina no encontrada</p>
            <a href="#/" class="vf-btn-primary">Ir al inicio</a>
          </div>
        </div>
      `
      return
    }

    await matched.handler(root, {
      navigate,
      params: matched.params,
      path: matched.path,
    })
  }
/* Repinta cuando cambia el hash o el tema */
  window.addEventListener('hashchange', render)
  window.addEventListener('versafit:theme', render)
  render()
}

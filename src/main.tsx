import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { createFoundationRuntime } from './foundation/runtime'
import { initializeStoreServices } from './stores'
import './styles.css'

async function bootstrap() {
  const foundationRuntime = await createFoundationRuntime()
  initializeStoreServices(foundationRuntime)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()

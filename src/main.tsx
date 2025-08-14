import { createRoot } from 'react-dom/client'

import App from './App'
import { initGarmentSubscriber } from './state/subscriptions'

initGarmentSubscriber()

createRoot(document.getElementById('root')!).render(<App />)

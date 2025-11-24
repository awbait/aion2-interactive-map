import { HeroUIProvider } from '@heroui/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import 'leaflet/dist/leaflet.css' // Leaflet default styles
import App from './App'
import { DataModeProvider } from './hooks/useDataMode'
import './i18n/i18n'
import './index.css'
import { applyTheme } from './utils/preTheme'

applyTheme()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		{/* You can pass locale/theme props later if you like */}
		<HeroUIProvider>
			<DataModeProvider>
				<App />
			</DataModeProvider>
		</HeroUIProvider>
	</React.StrictMode>
)

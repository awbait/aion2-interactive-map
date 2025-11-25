// src/hooks/useDataMode.ts
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react'

export type DataMode = 'static' | 'dynamic'

type DataModeContextValue = {
	dataMode: DataMode
	setDataMode: (mode: DataMode) => void
	toggleDataMode: () => void
	getBaseUrl: () => string
}

const DataModeContext = createContext<DataModeContextValue | undefined>(
	undefined
)

// --- helpers shared by provider & reload ---

function getStaticBaseUrl() {
	const env = (import.meta as any)?.env || {}
	return (env.BASE_URL ?? '/').replace(/\/+$/, '')
}

function computeBaseUrl(mode: DataMode): string {
	if (mode === 'static') {
		return getStaticBaseUrl()
	}

	// Dynamic mode
	if (import.meta.env.DEV) {
		// Running on Vite dev server
		return 'http://localhost:9000/api/v1/export' // your dev API
	}

	// Production build OR GitHub Pages
	if (import.meta.env.PROD) {
		return '/api/v1/export' // your production API
	}

	// Fallback (should never happen)
	return '/api/v1/export'
}

export function getBackendLoadPath() {
	const effectiveMode = 'static'
	const base = computeBaseUrl(effectiveMode)
	const staticBase = getStaticBaseUrl()
	return (lngs: string[], nss: string[]) => {
		const lng = lngs[0]
		const ns = nss[0]
		if (ns === 'common') {
			return `${staticBase}/locales/${lng}/${ns}.yaml`
		}
		return `${base}/locales/${lng}/${ns}.yaml`
	}
}

// --- Provider ---

type ProviderProps = {
	children: ReactNode
}

export function DataModeProvider({ children }: ProviderProps) {
	const [dataMode, setDataModeState] = useState<DataMode>(DEFAULT_DATA_MODE)

	const setDataMode = useCallback((mode: DataMode) => {
		setDataModeState(mode)
	}, [])

	const toggleDataMode = useCallback(() => {
		setDataModeState(prev => {
			const next = prev === 'static' ? 'dynamic' : 'static'
			console.log('toggleDataMode', prev, '->', next)
			return next
		})
	}, [])

	const getBaseUrl = useCallback(() => {
		return computeBaseUrl(dataMode)
	}, [dataMode])

	const value = useMemo<DataModeContextValue>(
		() => ({
			dataMode,
			setDataMode,
			toggleDataMode,
			getBaseUrl,
		}),
		[dataMode, setDataMode, toggleDataMode, getBaseUrl]
	)

	return (
		<DataModeContext.Provider value={value}>
			{children}
		</DataModeContext.Provider>
	)
}

// --- Hook ---

export function useDataMode(): DataModeContextValue {
	const ctx = useContext(DataModeContext)
	if (!ctx) {
		throw new Error('useDataMode must be used within a DataModeProvider')
	}
	return ctx
}

const DEFAULT_DATA_MODE: DataMode = normalize(
	import.meta.env.VITE_DEFAULT_DATA_MODE
)

function normalize(mode: string | undefined): DataMode {
	return mode === 'dynamic' ? 'dynamic' : 'static'
}

// // src/i18n.ts
// import i18n from 'i18next'
// import LanguageDetector from 'i18next-browser-languagedetector'
// import HttpBackend from 'i18next-http-backend'
// import { initReactI18next } from 'react-i18next'
// import { parse } from 'yaml'
// import { getBackendLoadPath } from '../hooks/useDataMode.tsx'

// // ---- Language config --------------------------------------

// export type LanguageCode = 'en' | 'ru'

// export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'ru']

// // ---- i18n initialization -----------------------------------

// i18n
// 	.use(HttpBackend)
// 	.use(LanguageDetector)
// 	.use(initReactI18next)
// 	.init({
// 		// lng: "zh-CN",
// 		fallbackLng: 'en',
// 		supportedLngs: SUPPORTED_LANGUAGES,

// 		ns: ['common', 'maps', 'types', 'regions'],
// 		defaultNS: 'common',

// 		detection: {
// 			// order of detection
// 			order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
// 			// caches to store detected language
// 			caches: ['localStorage'],
// 		},

// 		backend: {
// 			loadPath: getBackendLoadPath(),
// 			parse: (data: string) => parse(data),
// 		},

// 		interpolation: {
// 			escapeValue: false,
// 		},
// 	})

// export default i18n

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const modules = import.meta.glob('./locales/{en,ru}/*.yaml', { eager: true })

const resources: Record<string, Record<string, any>> = {}
export const SUPPORTED_LANGUAGES = ['en', 'ru']

for (const path in modules) {
	const file = modules[path] as any

	const [, , lng, nsWithExt] = path.split('/')
	const ns = nsWithExt.replace('.yaml', '')

	if (!resources[lng]) resources[lng] = {}
	resources[lng][ns] = file.default
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		supportedLngs: SUPPORTED_LANGUAGES,
		detection: {
			order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
			caches: ['localStorage'],
		},
		interpolation: { escapeValue: false },
	})

export default i18n

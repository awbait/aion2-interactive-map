import yaml from '@modyfi/vite-plugin-yaml'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'

function getGitVersion() {
	return execSync('git rev-parse HEAD').toString().trim()
}
const buildTime = process.env.BUILD_TIME ?? Date.now().toString()

// https://vite.dev/config/
export default defineConfig({
	base: process.env.VITE_PUBLIC_BASE || '/',
	plugins: [react(), tailwindcss(), yaml()],
	define: {
		__BUILD_TIME__: JSON.stringify(buildTime),
		__BUILD_GIT_COMMIT__: JSON.stringify(getGitVersion()),
	},
	build: {
		chunkSizeWarningLimit: 1000,
		rolldownOptions: {
			output: {
				advancedChunks: {
					groups: [
						// --- 1. React core bundle ---
						{
							name: 'vendor-react',
							test: /node_modules\/react(\/|$)|node_modules\/react-dom(\/|$)/,
						},

						// --- 2. UI & Helpers (HeroUI, FontAwesome, Embla, Markdown, YAML) ---
						{
							name: 'vendor-ui',
							test: /node_modules\/(@heroui|@nextui-org|@fortawesome|embla-carousel|react-markdown|remark|rehype|yaml)(\/|$)/,
						},

						// --- 3. Map engine bundle ---
						{
							name: 'vendor-map',
							test: /node_modules\/(leaflet|react-leaflet)(\/|$)/,
						},

						// --- 4. i18n bundle ---
						{
							name: 'vendor-i18n',
							test: /node_modules\/(i18next|i18next-http-backend|i18next-browser-languagedetector)(\/|$)/,
						},
					],
				},
			},
		},
	},
})

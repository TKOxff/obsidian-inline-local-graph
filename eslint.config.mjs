import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	// Build and maintenance scripts run in Node, not in Obsidian, so plugin rules do not apply.
	globalIgnores(["main.js", "node_modules/", "test-vault/", ".ai-workflow/", "*.mjs", "scripts/"]),
	...obsidianmd.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.mjs"],
				},
			},
		},
	},
]);

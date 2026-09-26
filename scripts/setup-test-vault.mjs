// Link build outputs into test-vault so Obsidian loads the plugin from the repo root.
import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const pluginDir = path.join(root, "test-vault", ".obsidian", "plugins", manifest.id);

fs.mkdirSync(pluginDir, { recursive: true });

for (const file of ["main.js", "manifest.json", "styles.css"]) {
	const link = path.join(pluginDir, file);
	fs.rmSync(link, { force: true });
	fs.symlinkSync(path.relative(pluginDir, path.join(root, file)), link, "file");
}

// hot-reload only watches plugin folders that contain .git or .hotreload
fs.writeFileSync(path.join(pluginDir, ".hotreload"), "");

console.log(`Linked plugin into ${path.relative(root, pluginDir)}`);

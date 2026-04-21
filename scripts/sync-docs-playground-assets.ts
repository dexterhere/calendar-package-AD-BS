import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const sourceDistDir = path.join(ROOT, 'dist')
const targetDistDir = path.join(ROOT, 'docs', 'public', 'dist')

function copyDirectory(sourceDir: string, destinationDir: string): void {
  fs.mkdirSync(destinationDir, { recursive: true })
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const destinationPath = path.join(destinationDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath)
      continue
    }

    fs.copyFileSync(sourcePath, destinationPath)
  }
}

function main(): void {
  if (!fs.existsSync(sourceDistDir)) {
    throw new Error('dist/ is missing. Run "pnpm build" before syncing playground assets.')
  }

  if (fs.existsSync(targetDistDir)) {
    fs.rmSync(targetDistDir, { recursive: true, force: true })
  }

  copyDirectory(sourceDistDir, targetDistDir)
  console.log(`[docs] Synced playground assets to ${path.relative(ROOT, targetDistDir)}`)
}

main()


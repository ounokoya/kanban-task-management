import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const b = await chromium.launch({ args: ['--disable-lcd-text'] }); const p = await b.newPage({ deviceScaleFactor: 1 })
for (const job of process.argv.slice(2)) {
  const [svg, png] = job.split(':')
  const src = readFileSync(svg, 'utf8'); const [, w, h] = src.match(/width="([\d.]+)" height="([\d.]+)"/)
  await p.setViewportSize({ width: Math.ceil(+w), height: Math.ceil(+h) })
  await p.goto('file://' + svg)
  await p.screenshot({ path: png, clip: { x: 0, y: 0, width: Math.ceil(+w), height: Math.ceil(+h) } })
  console.log('rendu', png)
}
await b.close()

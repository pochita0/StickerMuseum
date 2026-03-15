
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1600, 'height': 900, 'device_scale_factor': 1})
        await page.goto('http://127.0.0.1:5500/?v=20260316a', wait_until='networkidle')
        await page.screenshot(path='.codex-artifacts/gallery-controls-default.png')
        await page.locator('#galleryDarkness').fill('100')
        await page.screenshot(path='.codex-artifacts/gallery-controls-dark.png')
        await browser.close()

asyncio.run(main())

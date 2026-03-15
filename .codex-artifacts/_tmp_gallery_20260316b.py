
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1600, 'height': 900, 'device_scale_factor': 1})
        await page.goto('http://127.0.0.1:5500/?v=20260316b', wait_until='networkidle')
        await page.screenshot(path='.codex-artifacts/gallery-outer-lights-20260316b.png')
        await browser.close()

asyncio.run(main())

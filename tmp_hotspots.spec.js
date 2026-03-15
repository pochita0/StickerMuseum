const { test } = require("playwright/test");

test("print frame hotspots", async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1152 });
  await page.goto("http://127.0.0.1:4173/index.html?v=20260312s", { waitUntil: "networkidle" });

  const data = await page.locator(".frame-container").evaluateAll((els) => {
    return els.map((el, index) => {
      const rect = el.getBoundingClientRect();
      return {
        index,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        packIndex: el.dataset.packIndex
      };
    });
  });

  console.log(JSON.stringify(data, null, 2));
});

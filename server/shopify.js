import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get("/products", async (req, res) => {
  const store = process.env.SHOPIFY_STORE_URL;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!store || !token) return res.status(400).json({ error: "Shopify credentials missing" });
  try {
    const r = await fetch(`https://${store}/admin/api/2023-07/products.json?limit=5`, {
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" }
    });
    if (!r.ok) return res.status(r.status).json({ error: "Shopify API error" });
    const data = await r.json();
    res.json({ ok: true, count: (data.products||[]).length, products: (data.products||[]).map(p => ({ id: p.id, title: p.title })) });
  } catch (e) {
    console.error("[Shopify] error", e); res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;

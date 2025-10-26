import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/products", async (req, res) => {
  const store = process.env.SHOPIFY_STORE_URL;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!store || !token) {
    return res.status(400).json({ error: "Shopify credentials missing" });
  }

  try {
    const response = await fetch(`https://${store}/admin/api/2023-07/products.json?limit=5`, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "Shopify API error", details: text });
    }
    const data = await response.json();
    const products = (data.products || []).map(p => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      price: p.variants?.[0]?.price
    }));
    res.json({ ok: true, count: products.length, products });
  } catch (err) {
    console.error("[Shopify] API fetch error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;

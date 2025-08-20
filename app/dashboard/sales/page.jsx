// app/sales/page.jsx
export const dynamic = "force-dynamic";

import SalesClientPage from "./SalesClient";
import { fetchAllProducts } from "@/app/lib/data";

function serializeProduct(p) {
  if (!p) return null;

  // convert ObjectId/_id to string and dates to ISO strings
  const id = p._id ? String(p._id) : (p.id ? String(p.id) : "");
  const createdAt = p.createdAt ? (typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString()) : undefined;
  const updatedAt = p.updatedAt ? (typeof p.updatedAt === "string" ? p.updatedAt : p.updatedAt.toISOString()) : undefined;

  // make sure numeric fields are plain numbers
  const purchasePrice = p.purchasePrice !== undefined ? Number(p.purchasePrice) : undefined;
  const itemPrice = p.itemPrice !== undefined ? Number(p.itemPrice) : undefined;
  const totalItems = p.totalItems !== undefined ? Number(p.totalItems) : undefined;
  const units = p.units !== undefined ? Number(p.units) : undefined;
  const itemsPerUnit = p.itemsPerUnit !== undefined ? Number(p.itemsPerUnit) : undefined;
  const extraItems = p.extraItems !== undefined ? Number(p.extraItems) : undefined;


  // build a plain object with only serializable values (include other fields you need)
  return {
    // id (string) preferred for client
    id,
    // keep original title/desc etc.
    title: p.title ?? "",
    desc: p.desc ?? "",
    category: p.category ?? "",
    color: p.color ?? "",
    size: p.size ?? "",
    // numeric values
    purchasePrice,
    itemPrice,
    units,
    itemsPerUnit,
    extraItems,
    totalItems,
    // timestamps as ISO strings
    createdAt,
    updatedAt,
    // if you want to keep the full original raw object, do NOT pass it — it may contain non-serializable fields
    // don't include p._id (ObjectId) — we already provided id as string
  };
}

const SalesPage = async () => {
  let products = [];
  try {
    const raw = await fetchAllProducts(); // your function returns an array
    // ensure raw is an array
    const arr = Array.isArray(raw) ? raw : (raw?.products ?? []);
    // serialize each product to plain JS values
    products = arr.map(p => serializeProduct(p)).filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch all products for sales page", err);
    products = [];
  }

  return <SalesClientPage products={products} />;
};

export default SalesPage;

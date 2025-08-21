export const dynamic = "force-dynamic";

import SalesClientPage from "./SalesClient";
import { fetchAllProducts, fetchAllCustomers, fetchSales } from "@/app/lib/data";
import {
  addCustomerFromModal,
  updateCustomerFromModal,
  createSaleFromModal,
} from "@/app/lib/actions"; 

function serializeProduct(p) {
  if (!p) return null;
  const id = p._id ? String(p._id) : (p.id ? String(p.id) : "");
  const createdAt = p.createdAt ? (typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString()) : undefined;
  const updatedAt = p.updatedAt ? (typeof p.updatedAt === "string" ? p.updatedAt : p.updatedAt.toISOString()) : undefined;
  const purchasePrice = p.purchasePrice !== undefined ? Number(p.purchasePrice) : undefined;
  const itemPrice = p.itemPrice !== undefined ? Number(p.itemPrice) : undefined;
  const totalItems = p.totalItems !== undefined ? Number(p.totalItems) : undefined;
  const units = p.units !== undefined ? Number(p.units) : undefined;
  const itemsPerUnit = p.itemsPerUnit !== undefined ? Number(p.itemsPerUnit) : undefined;
  const extraItems = p.extraItems !== undefined ? Number(p.extraItems) : undefined;

  return {
    id,
    title: p.title ?? "",
    desc: p.desc ?? "",
    category: p.category ?? "",
    color: p.color ?? "",
    size: p.size ?? "",
    purchasePrice,
    itemPrice,
    units,
    itemsPerUnit,
    extraItems,
    totalItems,
    createdAt,
    updatedAt,
  };
}

function serializeCustomer(c) {
  if (!c) return null;
  const id = c._id ? String(c._id) : (c.id ? String(c.id) : "");
  const createdAt = c.createdAt ? (typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString()) : undefined;
  return {
    id,
    name: c.name ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    createdAt,
  };
}

function serializeSale(s) {
  if (!s) return null;
  // s is expected to be the plain object produced by fetchSales (id, items, subtotal, tax, total, paymentMethod, amountPaid, change, customer, sellerId, createdAt...)
  const id = s._id ? String(s._id) : (s.id ? String(s.id) : "");
  const createdAt = s.createdAt ? (typeof s.createdAt === "string" ? s.createdAt : s.createdAt.toISOString()) : (s.createdAt || undefined);
  const timestamp = createdAt ? new Date(createdAt).toLocaleString() : (s.timestamp || new Date().toLocaleString());
  return {
    id,
    timestamp,
    items: s.items ?? [],
    subtotal: Number(s.subtotal ?? 0),
    tax: Number(s.tax ?? 0),
    total: Number(s.total ?? 0),
    paymentMethod: s.paymentMethod ?? "cash",
    amountPaid: Number(s.amountPaid ?? 0),
    change: Number(s.change ?? 0),
    customer: s.customer ?? undefined,
    sellerId: s.sellerId ? String(s.sellerId) : undefined,
    createdAt,
  };
}

const SalesPage = async () => {
  let products = [];
  let customers = [];
  let sales = [];

  try {
    const rawProducts = await fetchAllProducts(); // returns array
    const prodArr = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.products ?? []);
    products = prodArr.map(p => serializeProduct(p)).filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch all products for sales page", err);
    products = [];
  }

  try {
    // fetch customers from DB
    const rawCustomers = await fetchAllCustomers(); // should return array
    const custArr = Array.isArray(rawCustomers) ? rawCustomers : (rawCustomers?.customers ?? []);
    customers = custArr.map(c => serializeCustomer(c)).filter(Boolean);
  } catch (err) {
    console.error("Failed to fetch customers for sales page", err);
    customers = [];
  }

  try {
    // fetch recent sales (adjust limit as needed)
    const { sales: fetchedSales = [] } = await fetchSales({ page: 1, limit: 100 });
    sales = Array.isArray(fetchedSales) ? fetchedSales.map(serializeSale).filter(Boolean) : [];
  } catch (err) {
    console.error("Failed to fetch sales for sales page", err);
    sales = [];
  }

  return (
    <SalesClientPage
      products={products}
      initialCustomers={customers}
      initialSales={sales}
      createCustomerAction={addCustomerFromModal}
      updateCustomerAction={updateCustomerFromModal}
      createSaleAction={createSaleFromModal}
    />
  );
};

export default SalesPage;

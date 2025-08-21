import { Product, User , Customer , Sale } from "./models";
import connect from "./utils";


export const fetchUsers = async (q = "", page = 1) => {
  const query = (typeof q === "string" ? q : "").trim();
  page = parseInt(page, 10) || 1;
  if (page < 1) page = 1;

  const ITEM_PER_PAGE = 2;
  const regex = new RegExp(query, "i");

  try {
    await connect();

    const filter = { username: { $regex: regex } };

    const count = await User.countDocuments(filter);

    const users = await User.find(filter)
      .skip(ITEM_PER_PAGE * (page - 1))
      .limit(ITEM_PER_PAGE)
      .lean();

    return { count, users };
  } catch (err) {
    console.error("fetchUsers error:", err);
    // ✅ Safe fallback instead of throwing (prevents build crash)
    return { count: 0, users: [] };
  }
};



export const fetchUser = async (id) => {
  console.log(id);
  try {
    await connect();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

export const fetchProducts = async (q = "", page = 1) => {
  const query = (typeof q === "string" ? q : "").trim();
  page = parseInt(page, 10) || 1;
  if (page < 1) page = 1;

  const ITEM_PER_PAGE = 2;
  const regex = new RegExp(query, "i");

  try {
    await connect();

    const filter = { title: { $regex: regex } };

    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip(ITEM_PER_PAGE * (page - 1))
      .limit(ITEM_PER_PAGE)
      .lean();

    return { count, products };
  } catch (err) {
    console.error("fetchProducts error:", err);
    // ✅ return safe fallback (prevents build crash)
    return { count: 0, products: [] };
  }
};


export const fetchAllProducts = async () => {
  try {
    await connect();

    // get products as plain JS objects
    const products = await Product.find().lean();

    return products; // just return the array directly
  } catch (err) {
    console.error("fetchAllProducts error:", err);
    return [];
  }
};

export const fetchProduct = async (id) => {
  try {
    await connect();
    const product = await Product.findById(id);
    return product;
  } catch (err) {
    console.log("error in fetchProduct: ",err);
    throw new Error("Failed to fetch product!");
  }
};






//customers


// Fetch customers with pagination & optional search
export const fetchCustomers = async (q = "", page = 1) => {
  const query = (typeof q === "string" ? q : "").trim();
  page = parseInt(page, 10) || 1;
  if (page < 1) page = 1;

  const ITEM_PER_PAGE = 10; // adjust per your needs
  const regex = new RegExp(query, "i");

  try {
    await connect();

    const filter = query ? { $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }, { phone: { $regex: regex } }] } : {};

    const count = await Customer.countDocuments(filter);

    const customers = await Customer.find(filter)
      .skip(ITEM_PER_PAGE * (page - 1))
      .limit(ITEM_PER_PAGE)
      .lean();

    // normalize id to string and ensure createdAt shape if you want:
    const plain = customers.map((c) => ({
      id: c._id.toString(),
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      createdAt: c.createdAt ? c.createdAt.toISOString().split("T")[0] : undefined,
      __raw: c, // optional for debugging
    }));

    return { count, customers: plain };
  } catch (err) {
    console.error("fetchCustomers error:", err);
    return { count: 0, customers: [] };
  }
};

// fetch a single customer by id
export const fetchCustomer = async (id) => {
  try {
    await connect();
    const customer = await Customer.findById(id).lean();
    if (!customer) return null;
    return {
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt ? customer.createdAt.toISOString().split("T")[0] : undefined,
      __raw: customer,
    };
  } catch (err) {
    console.error("fetchCustomer error:", err);
    return null;
  }
};

// fetch all customers (useful for sales UI select dropdowns)
export const fetchAllCustomers = async () => {
  try {
    await connect();
    const customers = await Customer.find().lean();
    return customers.map(c => ({
      id: c._id ? String(c._id) : (c.id ? String(c.id) : undefined),
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      createdAt: c.createdAt ? c.createdAt.toISOString().split("T")[0] : undefined,
    }));
  } catch (err) {
    console.error("fetchAllCustomers error:", err);
    return [];
  }
};



// Sales data

// Create a sale (low-level, server-side)
export const createSale = async (saleData) => {
  try {
    await connect();

    // normalize items if needed
    const sale = new Sale({
      items: saleData.items || [],
      subtotal: Number(saleData.subtotal || 0),
      tax: Number(saleData.tax || 0),
      total: Number(saleData.total || 0),
      paymentMethod: saleData.paymentMethod || "cash",
      amountPaid: Number(saleData.amountPaid || 0),
      change: Number(saleData.change || 0),
      customer: saleData.customer || undefined,
      sellerId: saleData.sellerId || undefined,
      notes: saleData.notes || undefined,
    });

    const saved = await sale.save();

    return {
      id: String(saved._id),
      items: saved.items,
      subtotal: saved.subtotal,
      tax: saved.tax,
      total: saved.total,
      paymentMethod: saved.paymentMethod,
      amountPaid: saved.amountPaid,
      change: saved.change,
      customer: saved.customer,
      sellerId: saved.sellerId ? String(saved.sellerId) : undefined,
      createdAt: saved.createdAt ? saved.createdAt.toISOString() : undefined,
      updatedAt: saved.updatedAt ? saved.updatedAt.toISOString() : undefined,
      notes: saved.notes,
    };
  } catch (err) {
    console.error("createSale error:", err);
    throw new Error("Failed to create sale!");
  }
};

// Fetch single sale by id
export const fetchSale = async (id) => {
  try {
    await connect();
    const s = await Sale.findById(id).lean();
    if (!s) return null;
    return {
      id: s._id.toString(),
      items: s.items,
      subtotal: s.subtotal,
      tax: s.tax,
      total: s.total,
      paymentMethod: s.paymentMethod,
      amountPaid: s.amountPaid,
      change: s.change,
      customer: s.customer,
      sellerId: s.sellerId ? String(s.sellerId) : undefined,
      createdAt: s.createdAt ? s.createdAt.toISOString() : undefined,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : undefined,
      notes: s.notes,
    };
  } catch (err) {
    console.error("fetchSale error:", err);
    return null;
  }
};


// Fetch many sales (with optional pagination / filter)
export const fetchSales = async ({ q = "", page = 1, limit = 20, sellerId = null } = {}) => {
  try {
    await connect();
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (q) {
      const regex = new RegExp(String(q), "i");
      filter.$or = [
        { "customer.name": { $regex: regex } },
        { paymentMethod: { $regex: regex } },
        { notes: { $regex: regex } }
      ];
    }

    const count = await Sale.countDocuments(filter);
    const rows = await Sale.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const data = rows.map(s => {
      const items = (s.items || []).map(it => ({
        productId: it.productId ? String(it.productId) : undefined,
        title: it.title ?? "",
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
        originalItemPrice: it.originalItemPrice !== undefined ? Number(it.originalItemPrice) : undefined,
        originalPurchasePrice: it.originalPurchasePrice !== undefined ? Number(it.originalPurchasePrice) : undefined,
      }));

      const customer = s.customer
        ? {
            id: s.customer.id ? String(s.customer.id) : (s.customer._id ? String(s.customer._id) : undefined),
            name: s.customer.name ?? "",
            email: s.customer.email ?? "",
            phone: s.customer.phone ?? "",
            address: s.customer.address ?? "",
          }
        : undefined;

      return {
        id: s._id ? String(s._id) : (s.id ? String(s.id) : undefined),
        items,
        subtotal: Number(s.subtotal ?? 0),
        tax: Number(s.tax ?? 0),
        total: Number(s.total ?? 0),
        paymentMethod: s.paymentMethod ?? "cash",
        amountPaid: Number(s.amountPaid ?? 0),
        change: Number(s.change ?? 0),
        customer,
        sellerId: s.sellerId ? String(s.sellerId) : undefined,
        createdAt: s.createdAt ? s.createdAt.toISOString() : undefined,
        updatedAt: s.updatedAt ? s.updatedAt.toISOString() : undefined,
        notes: s.notes ?? undefined,
      };
    });

    return { count, sales: data };
  } catch (err) {
    console.error("fetchSales error:", err);
    return { count: 0, sales: [] };
  }
};


// Update sale (limited fields)
export const updateSale = async (id, updateData) => {
  try {
    await connect();
    const updated = await Sale.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      items: updated.items,
      subtotal: updated.subtotal,
      tax: updated.tax,
      total: updated.total,
      paymentMethod: updated.paymentMethod,
      amountPaid: updated.amountPaid,
      change: updated.change,
      customer: updated.customer,
      sellerId: updated.sellerId ? String(updated.sellerId) : undefined,
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : undefined,
      updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
      notes: updated.notes,
    };
  } catch (err) {
    console.error("updateSale error:", err);
    throw new Error("Failed to update sale!");
  }
};

// Delete sale
export const deleteSale = async (id) => {
  try {
    await connect();
    await Sale.findByIdAndDelete(id);
    return true;
  } catch (err) {
    console.error("deleteSale error:", err);
    throw new Error("Failed to delete sale!");
  }
};




// DUMMY DATA

export const cards = [
  {
    id: 1,
    title: "Total Users",
    number: 10.928,
    change: 12,
  },
  {
    id: 2,
    title: "Stock",
    number: 8.236,
    change: -2,
  },
  {
    id: 3,
    title: "Revenue",
    number: 6.642,
    change: 18,
  },
];
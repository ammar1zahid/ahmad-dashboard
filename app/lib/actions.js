"use server";

import { revalidatePath } from "next/cache";
import { Product, User , Customer , Sale } from "./models";
import connect from "./utils";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

// ===========================
// User Actions
// ===========================

// ✅ Add User
export async function addUser(formData) {
  const { username, email, password, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);

  try {
    await connect();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      isAdmin,
      isActive,
    });

    await newUser.save();
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// ✅ Update User
export async function updateUser(formData) {
  const { id, username, email, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);

  try {
    await connect();

    await User.findByIdAndUpdate(id, {
      username,
      email,
      phone,
      address,
      isAdmin,
      isActive,
    });
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// ✅ Delete User
export async function deleteUser(formData) {
  const { id } = Object.fromEntries(formData);

  try {
    await connect();

    await User.findByIdAndDelete(id);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete user!");
  }

  revalidatePath("/dashboard/users");
}

// ===========================
// Product Actions
// ===========================

// helper to coerce numeric fields safely
function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ✅ Add Product
export async function addProduct(formData) {
  const {
    title,
    desc,
    purchasePrice,
    units,
    itemsPerUnit,
    extraItems,
    itemSalePrice,
    category,
    color,
    size,
  } = Object.fromEntries(formData);

  try {
    await connect();

    const newProduct = new Product({
      title,
      desc,
      purchasePrice: toNumber(purchasePrice, 0),
      units: toNumber(units, 0),
      itemsPerUnit: toNumber(itemsPerUnit, 0),
      extraItems: toNumber(extraItems, 0),
      itemSalePrice: toNumber(itemSalePrice, 0),
      category,
      color,
      size,
    });

    await newProduct.save(); // triggers pre("save") to recalc totalItems & itemPrice
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create product!");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

// ✅ Update Product
export async function updateProduct(formData) {
  const {
    id,
    title,
    desc,
    purchasePrice,
    units,
    itemsPerUnit,
    extraItems,
    itemSalePrice,
    category,
    color,
    size,
  } = Object.fromEntries(formData);

  try {
    await connect();

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    if (title !== undefined) product.title = title;
    if (desc !== undefined) product.desc = desc;
    if (purchasePrice !== undefined) product.purchasePrice = toNumber(purchasePrice, product.purchasePrice ?? 0);
    if (units !== undefined) product.units = toNumber(units, product.units ?? 0);
    if (itemsPerUnit !== undefined) product.itemsPerUnit = toNumber(itemsPerUnit, product.itemsPerUnit ?? 0);
    if (extraItems !== undefined) product.extraItems = toNumber(extraItems, product.extraItems ?? 0);
    if (itemSalePrice !== undefined) product.itemSalePrice = toNumber(itemSalePrice, product.itemSalePrice ?? 0);
    if (category !== undefined) product.category = category;
    if (color !== undefined) product.color = color;
    if (size !== undefined) product.size = size;

    await product.save(); // triggers pre("save")
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update product!");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

// ✅ Delete Product
export async function deleteProduct(formData) {
  const { id } = Object.fromEntries(formData);

  try {
    await connect();
    await Product.findByIdAndDelete(id);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete product!");
  }

  revalidatePath("/dashboard/products");
}


// ------------------ Customers ------------------

// Add Customer
export async function addCustomer(formData) {
  const { name, email, phone, address } = Object.fromEntries(formData);

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  try {
    await connect();

    const newCustomer = new Customer({
      name,
      email,
      phone,
      address,
    });

    await newCustomer.save();
  } catch (err) {
    console.error("addCustomer error:", err);
    throw new Error("Failed to create customer!");
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

// Update Customer
export async function updateCustomer(formData) {
  const { id, name, email, phone, address } = Object.fromEntries(formData);

  if (!id) throw new Error("Customer id is required");
  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  try {
    await connect();

    const customer = await Customer.findById(id);
    if (!customer) throw new Error("Customer not found");

    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;

    await customer.save();
  } catch (err) {
    console.error("updateCustomer error:", err);
    throw new Error("Failed to update customer!");
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}
// Add Customer from Modal
export async function addCustomerFromModal(data) {
  "use server";
  const { name, email, phone, address } = data ?? {};

  if (!name || !email) throw new Error("Name and email are required");

  await connect();

  const newCustomer = new Customer({ name, email, phone, address });
  const saved = await newCustomer.save();

  return {
    id: String(saved._id),
    name: saved.name,
    email: saved.email,
    phone: saved.phone ?? "",
    address: saved.address ?? "",
    createdAt: saved.createdAt ? saved.createdAt.toISOString() : undefined,
  };
}

// Update Customer from Modal
export async function updateCustomerFromModal(id, data) {
  "use server";
  const { name, email, phone, address } = data ?? {};

  if (!id) throw new Error("Customer id is required");
  if (!name || !email) throw new Error("Name and email are required");

  await connect();

  const updated = await Customer.findByIdAndUpdate(
    id,
    { name, email, phone, address },
    { new: true }
  );

  if (!updated) throw new Error("Customer not found");

  return {
    id: String(updated._id),
    name: updated.name,
    email: updated.email,
    phone: updated.phone ?? "",
    address: updated.address ?? "",
    createdAt: updated.createdAt ? updated.createdAt.toISOString() : undefined,
  };
}

// Delete Customer
export async function deleteCustomer(formData) {
  const { id } = Object.fromEntries(formData);

  if (!id) throw new Error("Customer id is required");

  try {
    await connect();
    await Customer.findByIdAndDelete(id);
  } catch (err) {
    console.error("deleteCustomer error:", err);
    throw new Error("Failed to delete customer!");
  }

  revalidatePath("/dashboard/customers");
}




// ===========================
// Sales Actions
// ===========================




// Create Sale from client (server action)
export async function createSaleFromModal(saleData = {}) {
  // saleData expected shape:
  // { items: [{ productId, title, quantity, price, originalItemPrice, originalPurchasePrice }, ...], ... }

  // Resolve sellerId from session if possible
  let sellerId;
  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route"); // adjust path if different

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      sellerId = session.user.id;
    } else {
      sellerId = saleData.sellerId || undefined;
    }
  } catch (e) {
    sellerId = saleData.sellerId || undefined;
  }

  // Basic validation
  if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
    throw new Error("Sale must include at least one item");
  }

  // coerce numbers
  const subtotal = Number(saleData.subtotal || 0);
  const tax = Number(saleData.tax || 0);
  const total = Number(saleData.total || 0);
  const amountPaid = Number(saleData.amountPaid || 0);
  const change = Number(saleData.change || 0);

  try {
    await connect();

    const newSale = new Sale({
      items: saleData.items.map(it => ({
        // keep productId as ObjectId on DB write (if provided), but allow string too
        productId: it.productId ? it.productId : undefined,
        title: it.title ?? "",
        quantity: Number(it.quantity || 1),
        price: Number(it.price || 0),
        originalItemPrice: it.originalItemPrice !== undefined ? Number(it.originalItemPrice) : undefined,
        originalPurchasePrice: it.originalPurchasePrice !== undefined ? Number(it.originalPurchasePrice) : undefined
      })),
      subtotal,
      tax,
      total,
      paymentMethod: saleData.paymentMethod || "cash",
      amountPaid,
      change,
      customer: saleData.customer || undefined,
      sellerId: sellerId ? sellerId : undefined,
      notes: saleData.notes || undefined,
    });

    const saved = await newSale.save();

    // optional: revalidate listing page
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/sales");
    } catch (e) {
      // ignore if revalidate not available
    }

    // map saved result to plain serializable object
    const mappedItems = (saved.items || []).map(it => ({
      productId: it.productId ? String(it.productId) : undefined,
      title: it.title ?? "",
      quantity: Number(it.quantity || 0),
      price: Number(it.price || 0),
      originalItemPrice: it.originalItemPrice !== undefined ? Number(it.originalItemPrice) : undefined,
      originalPurchasePrice: it.originalPurchasePrice !== undefined ? Number(it.originalPurchasePrice) : undefined,
    }));

    const mappedCustomer = saved.customer
      ? {
          // handle both saved.customer.id or saved.customer._id shape
          id: saved.customer.id ? String(saved.customer.id) : (saved.customer._id ? String(saved.customer._id) : undefined),
          name: saved.customer.name ?? "",
          email: saved.customer.email ?? "",
          phone: saved.customer.phone ?? "",
          address: saved.customer.address ?? "",
        }
      : undefined;

    return {
      id: String(saved._id),
      items: mappedItems,
      subtotal: Number(saved.subtotal || 0),
      tax: Number(saved.tax || 0),
      total: Number(saved.total || 0),
      paymentMethod: saved.paymentMethod ?? "cash",
      amountPaid: Number(saved.amountPaid || 0),
      change: Number(saved.change || 0),
      customer: mappedCustomer,
      sellerId: saved.sellerId ? String(saved.sellerId) : undefined,
      createdAt: saved.createdAt ? saved.createdAt.toISOString() : undefined,
      updatedAt: saved.updatedAt ? saved.updatedAt.toISOString() : undefined,
      notes: saved.notes ?? undefined,
    };
  } catch (err) {
    console.error("createSaleFromModal error:", err);
    throw new Error("Failed to save sale!");
  }
}




// Update existing sale (server action) — expects FormData when used as <form action={updateSaleFromModal}>
// export async function updateSaleFromModal(formData) {
//   "use server";
//   // formData is a FormData object when coming from <form action=...>
//   const id = formData instanceof FormData ? formData.get("id") : formData?.id;
//   if (!id) throw new Error("Sale id is required");

//   // Extract fields you allow to update
//   const paymentMethod = formData.get("paymentMethod") || undefined;
//   const amountPaidRaw = formData.get("amountPaid");
//   const amountPaid = amountPaidRaw !== null && amountPaidRaw !== "" ? Number(amountPaidRaw) : undefined;
//   const notes = formData.get("notes") || undefined;

//   const updateData = {};
//   if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
//   if (!Number.isNaN(amountPaid) && amountPaid !== undefined) updateData.amountPaid = amountPaid;
//   if (notes !== undefined) updateData.notes = notes;

//   try {
//     await connect();

//     const updated = await Sale.findByIdAndUpdate(id, updateData, { new: true }).lean();
//     if (!updated) throw new Error("Sale not found");

//     // revalidate sales list page if available
//     try {
//       const { revalidatePath } = await import("next/cache");
//       revalidatePath("/sales");
//     } catch (e) {
//       // ignore if revalidate not available
//     }

//     // Serialize same as fetchSale to return safe plain object
//     return {
//       id: updated._id.toString(),
//       items: (updated.items || []).map(it => ({
//         _id: it._id?.toString?.(),
//         productId: it.productId?.toString?.(),
//         title: it.title,
//         quantity: it.quantity,
//         price: it.price,
//         originalItemPrice: it.originalItemPrice
//       })),
//       subtotal: updated.subtotal,
//       tax: updated.tax,
//       total: updated.total,
//       paymentMethod: updated.paymentMethod,
//       amountPaid: updated.amountPaid,
//       change: updated.change,
//       customer: updated.customer,
//       sellerId: updated.sellerId ? String(updated.sellerId) : undefined,
//       createdAt: updated.createdAt ? updated.createdAt.toISOString() : undefined,
//       updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
//       notes: updated.notes,
//     };
//   } catch (err) {
//     console.error("updateSaleFromModal error:", err);
//     throw new Error("Failed to update sale!");
//   }
// }

export async function updateSaleFromModal(formData) {
  "use server";
  const data = formData instanceof FormData ? Object.fromEntries(formData) : formData || {};
  const { id, paymentMethod, amountPaid, notes } = data;
  if (!id) throw new Error("Sale id is required");

  const updateData = {};
  if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
  if (amountPaid !== undefined && amountPaid !== "") updateData.amountPaid = Number(amountPaid);
  if (notes !== undefined) updateData.notes = notes;

  try {
    await connect();
    const updated = await Sale.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) throw new Error("Sale not found");
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/transactions");
      revalidatePath(`/dashboard/transactions/${id}`);
    } catch (e) {
      // ignore if revalidate not available
    }
    return true;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update sale!");
  }
}


// Delete sale (server action)
// app/lib/actions.js

export async function deleteSaleFromModal(formData) {
  "use server";
  const data = formData instanceof FormData ? Object.fromEntries(formData) : formData || {};
  const id = data.id;
  if (!id) throw new Error("Sale id is required");

  try {
    await connect();
    await Sale.findByIdAndDelete(id);
    // revalidate the correct path you use in your app:
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/transactions"); // use the route you want refreshed
    } catch (e) {
      // ignore if revalidate not available
    }
    return true;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete sale!");
  }
}



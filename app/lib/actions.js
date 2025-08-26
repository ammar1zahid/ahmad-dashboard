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

export async function updateSaleFromModal(formData) {

  // normalize incoming data whether it's FormData or plain object
  const data = formData instanceof FormData ? Object.fromEntries(formData) : formData || {};
  const {
    id,
    paymentMethod,
    amountPaid: amountPaidRaw,
    notes,
    status: requestedStatus,
    totalAmount: totalAmountRaw
  } = data;

  if (!id) throw new Error("Sale id is required");

  
  // parse numeric inputs (if provided)
  const totalNum = totalAmountRaw !== undefined && totalAmountRaw !== "" ? Number(totalAmountRaw) : undefined;
  const amountPaidNum = amountPaidRaw !== undefined && amountPaidRaw !== "" ? Number(amountPaidRaw) : undefined;

  if (totalNum !== undefined && Number.isNaN(totalNum)) throw new Error("Invalid totalAmount");
  if (amountPaidNum !== undefined && Number.isNaN(amountPaidNum)) throw new Error("Invalid amountPaid");

  // Decide final status:
  // - If both amountPaid and total are provided:
  //     - amountPaid >= total  -> force "completed"
  //     - amountPaid < total   -> force "pending"
  // - Else if requestedStatus is valid -> use requestedStatus
  // - Else do not change status (leave undefined so we don't overwrite)
  const allowedStatuses = ["completed", "pending", "cancelled"];
  let finalStatus = undefined;

  if (typeof amountPaidNum === "number" && typeof totalNum === "number") {
    finalStatus = amountPaidNum >= totalNum ? "completed" : "pending";
  } else if (typeof requestedStatus === "string" && allowedStatuses.includes(requestedStatus)) {
    finalStatus = requestedStatus;
  }

  // Build update object - include only provided/needed fields
  const updateData = {};
  if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
  if (amountPaidNum !== undefined) updateData.amountPaid = amountPaidNum;
  if (notes !== undefined) updateData.notes = notes;
  if (finalStatus !== undefined) updateData.status = finalStatus;
  if (amountPaidNum !== undefined && totalNum !== undefined) {
    updateData.change = Math.max(0, amountPaidNum - totalNum);
  }

  // If nothing to update, return early (but revalidate to be safe)
  if (Object.keys(updateData).length === 0) {
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/transactions");
      revalidatePath(`/dashboard/transactions/${id}`);
    } catch (e) {
      // ignore
    }
    return { ok: true };
  }

  // Persist update and return serialized plain object
  await connect();
  const updated = await Sale.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!updated) throw new Error("Sale not found after update");

  // Revalidate relevant pages
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/transactions");
    revalidatePath(`/dashboard/transactions/${id}`);
  } catch (e) {
    // ignore if unavailable
  }

  // Serialize updated doc to plain JS (convert ObjectIds / Dates to primitives)
  const items = Array.isArray(updated.items)
    ? updated.items.map(it => ({
        _id: it._id?.toString?.() || undefined,
        productId: it.productId?.toString?.() || it.productId || undefined,
        title: it.title || it.name || undefined,
        quantity: typeof it.quantity === "number" ? it.quantity : Number(it.quantity || 0),
        price: typeof it.price === "number" ? it.price : Number(it.price || 0),
        originalItemPrice:
          typeof it.originalItemPrice === "number"
            ? it.originalItemPrice
            : it.originalItemPrice
            ? Number(it.originalItemPrice)
            : undefined,
      }))
    : [];

  const serialized = {
    id: updated._id?.toString?.(),
    items,
    subtotal: typeof updated.subtotal === "number" ? updated.subtotal : Number(updated.subtotal || 0),
    tax: typeof updated.tax === "number" ? updated.tax : Number(updated.tax || 0),
    total: typeof updated.total === "number" ? updated.total : Number(updated.total || 0),
    paymentMethod: updated.paymentMethod || "",
    amountPaid: typeof updated.amountPaid === "number" ? updated.amountPaid : Number(updated.amountPaid || 0),
    change: typeof updated.change === "number" ? updated.change : Number(updated.change || 0),
    customer: updated.customer
      ? {
          id: updated.customer.id?.toString?.() || updated.customer.id || undefined,
          name: updated.customer.name || "",
          email: updated.customer.email || "",
          phone: updated.customer.phone || ""
        }
      : null,
    sellerId: updated.sellerId ? String(updated.sellerId) : undefined,
    createdAt: updated.createdAt ? updated.createdAt.toISOString() : undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    notes: updated.notes || "",
    status: updated.status || "completed",
  };

  return serialized;
}



// server action: create sale using a transaction to avoid race conditions
export async function createSaleFromModal(saleData = {}) {
  "use server";
  

  // resolve seller id (same as your previous implementation)
  let sellerId;
  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
    const session = await getServerSession(authOptions);
    if (session?.user?.id) sellerId = session.user.id;
    else sellerId = saleData.sellerId || undefined;
  } catch (e) {
    sellerId = saleData.sellerId || undefined;
  }

  if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
    throw new Error("Sale must include at least one item");
  }

  // coerce numbers
  const subtotal = Number(saleData.subtotal || 0);
  const tax = Number(saleData.tax || 0);
  const total = Number(saleData.total || 0);
  const amountPaid = Number(saleData.amountPaid || 0);
  const change = Number(saleData.change || 0);

  // ensure DB connected
  await connect();

  // dynamic import mongoose so we don't need to change file-level imports
  const mongoose = (await import("mongoose")).default;

  // create a session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // create the Sale document within the session
    const newSale = new Sale({
      items: saleData.items.map(it => ({
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
      status: saleData.status || "completed",
    });

    const saved = await newSale.save({ session });

    // For each sold item that references a productId, atomically decrement product stock
    for (const it of saved.items || []) {
      if (!it.productId) continue;
      const productId = String(it.productId);
      const soldItems = Number(it.quantity || 0);
      if (soldItems <= 0) continue;

      // Use an aggregation-pipeline update so we can compute and set derived fields atomically.
      // The filter ensures there's enough stock (currentTotal >= soldItems).
      const filter = {
        _id: productId,
        $expr: {
          $gte: [
            { $add: [{ $multiply: ["$units", "$itemsPerUnit"] }, "$extraItems"] },
            soldItems
          ]
        }
      };

      const pipeline = [
        // compute currentTotal and newTotal
        {
          $set: {
            __currentTotal: { $add: [{ $multiply: ["$units", "$itemsPerUnit"] }, "$extraItems"] },
          }
        },
        {
          $set: {
            __newTotal: { $subtract: ["$__currentTotal", soldItems] }
          }
        },
        // derive new units, extraItems, totalItems, itemPrice
        {
          $set: {
            units: {
              $cond: [
                { $gt: ["$itemsPerUnit", 0] },
                { $floor: { $divide: ["$__newTotal", "$itemsPerUnit"] } },
                0
              ]
            },
            extraItems: {
              $cond: [
                { $gt: ["$itemsPerUnit", 0] },
                { $mod: ["$__newTotal", "$itemsPerUnit"] },
                "$__newTotal"
              ]
            },
            totalItems: "$__newTotal",
            itemPrice: {
              $cond: [
                { $gt: ["$__newTotal", 0] },
                { $divide: ["$purchasePrice", "$__newTotal"] },
                0
              ]
            }
          }
        },
        { $unset: ["__currentTotal", "__newTotal"] }
      ];

      const updatedProduct = await Product.findOneAndUpdate(filter, pipeline, { new: true, session });

      if (!updatedProduct) {
        // insufficient stock or product disappeared
        throw new Error(
          `Insufficient stock for product ${productId} (requested ${soldItems}).`
        );
      }
    }

    // all product updates succeeded, commit
    await session.commitTransaction();
    session.endSession();

    // revalidate page if desired
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/sales");
    } catch (e) {
      // ignore if not available
    }

    // return mapped saved sale (same as your original mapping)
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
    // abort transaction and rethrow
    try {
      await session.abortTransaction();
      session.endSession();
    } catch (abortErr) {
      console.error("Failed to abort transaction:", abortErr);
    }
    console.error("Transaction failed during createSaleFromModal:", err);
    // surface useful message
    throw new Error(err.message || "Failed to create sale (transaction aborted).");
  }
}

// server action: delete sale using transaction to restore stock atomically
export async function deleteSaleFromModal(formData) {
  "use server";

  const data = formData instanceof FormData ? Object.fromEntries(formData) : formData || {};
  const id = data.id;
  if (!id) throw new Error("Sale id is required");

  await connect();
  const mongoose = (await import("mongoose")).default;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(id).session(session).lean();
    if (!sale) throw new Error("Sale not found");

    // restore stock for each product item
    for (const it of sale.items || []) {
      if (!it.productId) continue;
      const productId = String(it.productId);
      const returnedItems = Number(it.quantity || 0);
      if (returnedItems <= 0) continue;

      // use aggregation pipeline update to recompute totals
      const pipeline = [
        {
          $set: {
            __currentTotal: { $add: [{ $multiply: ["$units", "$itemsPerUnit"] }, "$extraItems"] }
          }
        },
        {
          $set: {
            __newTotal: { $add: ["$__currentTotal", returnedItems] }
          }
        },
        {
          $set: {
            units: {
              $cond: [
                { $gt: ["$itemsPerUnit", 0] },
                { $floor: { $divide: ["$__newTotal", "$itemsPerUnit"] } },
                0
              ]
            },
            extraItems: {
              $cond: [
                { $gt: ["$itemsPerUnit", 0] },
                { $mod: ["$__newTotal", "$itemsPerUnit"] },
                "$__newTotal"
              ]
            },
            totalItems: "$__newTotal",
            itemPrice: {
              $cond: [
                { $gt: ["$__newTotal", 0] },
                { $divide: ["$purchasePrice", "$__newTotal"] },
                0
              ]
            }
          }
        },
        { $unset: ["__currentTotal", "__newTotal"] }
      ];

      // update product
      await Product.findByIdAndUpdate(productId, pipeline, { new: true, session });
    }

    // delete the sale
    await Sale.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    // revalidate listing page
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/transactions");
    } catch (e) {
      // ignore
    }

    return true;
  } catch (err) {
    try {
      await session.abortTransaction();
      session.endSession();
    } catch (abortErr) {
      console.error("Failed to abort transaction:", abortErr);
    }
    console.error("Transaction failed during deleteSaleFromModal:", err);
    throw new Error(err.message || "Failed to delete sale (transaction aborted).");
  }
}



"use server";

import { revalidatePath } from "next/cache";
import { Product, User , Customer } from "./models";
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
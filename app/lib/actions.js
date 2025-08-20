"use server";

import { revalidatePath } from "next/cache";
import { Product, User } from "./models";
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

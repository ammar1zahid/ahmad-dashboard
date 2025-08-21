import { Product, User , Customer } from "./models";
import connect from "./utils";


// export const fetchUsers = async (q,page) => {
 
//   const regex = new RegExp(q, "i");
//   const ITEM_PER_PAGE = 2;

//   try {
//     await connect();
//     // const users = await User.find();
//     // return users
//     const count = await User.find({ username: { $regex: regex } }).count();
//     const users = await User.find({ username: { $regex: regex } })
//       .limit(ITEM_PER_PAGE)
//       .skip(ITEM_PER_PAGE * (page - 1));
//     return { count, users };
//   } catch (err) {
//     console.log(err);
//     throw new Error("Failed to fetch users!");
//   }
// };


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

// fetch all products
// export const fetchAllProducts = async () => {
//   try {
//     await connect();

//     const products = await Product.find().lean();

//     // normalize _id and keep things client-safe
//     const plainProducts = products.map((p) => ({
//       id: p._id.toString(),
//       name: p.title ?? "",
//       purchasePrice: Number(p.purchasePrice),
//       category: p.category ?? "General",
//       barcode: p._id.toString(), // using id as barcode
//       totalItems: Number(p.totalItems ?? 0),
//       // __raw: p, 
//     }));

//     return { count: plainProducts.length, products: plainProducts };
//   } catch (err) {
//     console.error("fetchAllProducts error:", err);
//     return { count: 0, products: [] };
//   }
// };


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
      id: c._id.toString(),
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
// app/lib/models.js


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, min: 3, max: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  address: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    purchasePrice: { type: Number, required: true, min: 0 }, //overall price of all items
    units: { type: Number, required: true, min: 0 },
    itemsPerUnit: { type: Number, required: true, min: 0 }, 
    extraItems: { type: Number, default: 0, min: 0 },
    category: { type: String },
    color: { type: String },
    size: { type: String },
    //persisted calculated fields 
    totalItems: { type: Number, default: 0 },
    itemPrice: { type: Number, default: 0 }, // price per item
  },
  { timestamps: true }
);

// Pre-save hook to calculate fields before saving
productSchema.pre("save", function (next) {
  this.totalItems = (this.units * this.itemsPerUnit) + this.extraItems;
  this.itemPrice = this.totalItems > 0 ? this.purchasePrice / this.totalItems : 0;
  next();
});


const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, min: 1 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    // You can add other fields such as company, notes, customerType, etc.
  },
  { timestamps: true } // createdAt, updatedAt
);


const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },       //  sale price per item
  originalItemPrice: { type: Number, min: 0 },           //  purchase price per item
  originalPurchasePrice: { type: Number, min: 0 },       //   pruchase stock price
  // you can add SKU/barcode if needed
}, { _id: false });

const saleSchema = new mongoose.Schema({
  items: { type: [saleItemSchema], required: true, default: [] },
  subtotal: { type: Number, required: true, min: 0, default: 0 },
  tax: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0, default: 0 },
  paymentMethod: { type: String, enum: ["cash","card","digital","other"], default: "cash" },
  amountPaid: { type: Number, min: 0, default: 0 },
  change: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["completed", "pending", "cancelled"],   default: "completed" },

  // Snapshot of customer at time of sale (optional)
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
  },

  // reference to seller (user) who created the sale
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },


}, { timestamps: true });




export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
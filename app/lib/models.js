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
    itemSalePrice: { type: Number, min: 0 }, //sale price per item
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

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

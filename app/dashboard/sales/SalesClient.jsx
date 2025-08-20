// app/sales/SalesClient.jsx
"use client";

import React, { useState } from "react";
import ProductsSection from "../../components/sales/ProductsSection/ProductsSection";
import CartSection from "../../components/sales/CartSection/CartSection";
import SalesHistory from "../../components/sales/SalesHistory/SalesHistory";
import QuickStats from "../../components/sales/QuickStats/QuickStats";
import CustomerModal from "../../components/sales/CustomerModal/CustomerModal";
import ReceiptModal from "../../components/sales/ReceiptModal/ReceiptModal";
import "../../components/sales/sales.module.css";

/**
 * Client-side SalesPage component
 * Props:
 *   - products: array of { id, name, price, category, barcode, totalItems, ... }
 */
const SalesClientPage = ({ products: initialProducts = [] }) => {
  // Use fetched products instead of static list
  const [products] = useState(initialProducts);

  // Keep existing static customers
  const [customers, setCustomers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "555-0123", address: "123 Main St", createdAt: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "555-0456", address: "456 Oak Ave", createdAt: "2024-01-20" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-0789", address: "789 Pine Rd", createdAt: "2024-02-01" }
  ]);

  // State management
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [userModalMode, setUserModalMode] = useState(null);

  // Cart operations (no changes)
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Basic calculations (these will be overridden by CartSection for custom pricing)
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const calculateChange = (amountPaid) => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  };

  // Customer operations
  const handleCreateCustomer = (customerForm) => {
    if (!customerForm.name || !customerForm.email) {
      alert('Name and email are required!');
      return false;
    }

    const newCustomer = {
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      ...customerForm,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCustomers([...customers, newCustomer]);
    setSelectedCustomer(newCustomer);
    setUserModalMode(null);
    return true;
  };

  const handleEditCustomer = (customerForm) => {
    if (!selectedCustomer || !customerForm.name || !customerForm.email) {
      alert('Name and email are required!');
      return false;
    }

    const updatedCustomer = {
      ...selectedCustomer,
      ...customerForm
    };

    setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    setUserModalMode(null);
    return true;
  };

  // Process sale - updated to handle custom transactions from CartSection
  const processSale = (paymentMethod, amountPaid, customTransaction = null) => {
    // If a custom transaction is provided (from CartSection), use it directly
    if (customTransaction) {
      setSalesHistory([customTransaction, ...salesHistory]);
      setLastTransaction(customTransaction);
      setCart([]);
      setSelectedCustomer(null);
      setShowReceipt(true);
      return;
    }

    // Fallback to original logic (shouldn't be used with new CartSection)
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'cash' && paid < total) {
      alert('Insufficient payment amount!');
      return;
    }

    const transaction = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      items: [...cart],
      subtotal: calculateSubtotal(),
      tax: calculateTax(calculateSubtotal()),
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: paymentMethod === 'cash' ? paid : total,
      change: paymentMethod === 'cash' ? calculateChange(amountPaid) : 0,
      customer: selectedCustomer || undefined
    };

    setSalesHistory([transaction, ...salesHistory]);
    setLastTransaction(transaction);
    setCart([]);
    setSelectedCustomer(null);
    setShowReceipt(true);
  };

  return (
    <div className="sales-page">
      <h1 className="sales-title">
        <svg style={{ marginRight: '10px' }} className="sales-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Point of Sale System
      </h1>

      <div className="sales-content">
        {/* Products Section */}
        <ProductsSection 
          products={products}
          addToCart={addToCart}
        />

        {/* Cart Section */}
        <CartSection
          cart={cart}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          setUserModalMode={setUserModalMode}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          calculateSubtotal={calculateSubtotal}
          calculateTax={calculateTax}
          calculateTotal={calculateTotal}
          calculateChange={calculateChange}
          processSale={processSale}
        />
      </div>

      {/* Sales History */}
      <SalesHistory salesHistory={salesHistory} />

      {/* Quick Stats */}
      <QuickStats 
        salesHistory={salesHistory}
        customers={customers}
      />

      {/* Customer Modal */}
      {userModalMode && (
        <CustomerModal
          mode={userModalMode}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          setUserModalMode={setUserModalMode}
          handleCreateCustomer={handleCreateCustomer}
          handleEditCustomer={handleEditCustomer}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default SalesClientPage;
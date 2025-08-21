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
 *   - products: array of serialized products (from server)
 *   - initialCustomers: array of serialized customers (from server)
 */
const SalesClientPage = ({ products: initialProducts = [], initialCustomers = [] , createCustomerAction, updateCustomerAction}) => {
  // Use fetched products instead of static list
  const [products] = useState(initialProducts);

  // Initialize customers from server-provided list (falls back to empty array)
  const [customers, setCustomers] = useState(
    Array.isArray(initialCustomers) && initialCustomers.length > 0
      ? initialCustomers
      : []
  );

  // State management
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [userModalMode, setUserModalMode] = useState(null);

  // Cart operations
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

  // Basic calculations
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

  // Customer operations (client-only — still local state)
//   const handleCreateCustomer = (customerForm) => {
//     if (!customerForm.name || !customerForm.email) {
//       alert('Name and email are required!');
//       return false;
//     }

//     // DB customers use string ids; generate a stable temporary id for client-side entries
//     const newCustomer = {
//       id: String(Date.now()),
//       ...customerForm,
//       createdAt: new Date().toISOString().split('T')[0]
//     };

//     setCustomers(prev => [...prev, newCustomer]);
//     setSelectedCustomer(newCustomer);
//     setUserModalMode(null);
//     return true;
//   };

//   const handleEditCustomer = (customerForm) => {
//     if (!selectedCustomer || !customerForm.name || !customerForm.email) {
//       alert('Name and email are required!');
//       return false;
//     }

//     const updatedCustomer = {
//       ...selectedCustomer,
//       ...customerForm
//     };

//     setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
//     setSelectedCustomer(updatedCustomer);
//     setUserModalMode(null);
//     return true;
//   };


    const handleCreateCustomer = async (customerForm) => {
    if (!customerForm.name || !customerForm.email) {
      alert('Name and email are required!');
      return false;
    }

    try {
      const createdCustomer = await createCustomerAction(customerForm);
      setCustomers(prev => [...prev, createdCustomer]);
      setSelectedCustomer(createdCustomer);
      setUserModalMode(null);
      return true;
    } catch (err) {
      console.error('create customer (server action) error:', err);
      alert('Failed to create customer.');
      return false;
    }
  };

  const handleEditCustomer = async (customerForm) => {
    if (!selectedCustomer || !customerForm.name || !customerForm.email) {
      alert('Name and email are required!');
      return false;
    }

    try {
      const updatedCustomer = await updateCustomerAction(selectedCustomer.id, customerForm);
      setCustomers(prev => prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
      setSelectedCustomer(updatedCustomer);
      setUserModalMode(null);
      return true;
    } catch (err) {
      console.error('update customer (server action) error:', err);
      alert('Failed to update customer.');
      return false;
    }
  };
  // Process sale
  const processSale = (paymentMethod, amountPaid, customTransaction = null) => {
    if (customTransaction) {
      setSalesHistory([customTransaction, ...salesHistory]);
      setLastTransaction(customTransaction);
      setCart([]);
      setSelectedCustomer(null);
      setShowReceipt(true);
      return;
    }

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
        <ProductsSection 
          products={products}
          addToCart={addToCart}
        />

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

      <SalesHistory salesHistory={salesHistory} />

      <QuickStats 
        salesHistory={salesHistory}
        customers={customers}
      />

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

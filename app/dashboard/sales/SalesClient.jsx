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
 *   - initialSales: array of serialized sales (from server)
 *   - createCustomerAction, updateCustomerAction: server actions
 *   - createSaleAction, updateSaleAction: server actions for sales
 */
const SalesClientPage = ({
  products: initialProducts = [],
  initialCustomers = [],
  initialSales = [],
  createCustomerAction,
  updateCustomerAction,
  createSaleAction,

}) => {
  // Use fetched products instead of static list
  const [products] = useState(initialProducts);

  // Initialize customers from server-provided list (falls back to empty array)
  const [customers, setCustomers] = useState(
    Array.isArray(initialCustomers) && initialCustomers.length > 0 ? initialCustomers : []
  );

  // State management
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // use persisted sales as initial history (server-supplied)
  const [salesHistory, setSalesHistory] = useState(Array.isArray(initialSales) ? initialSales : []);
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

  // Customer operations (server actions)
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

  // Persist sale to DB via server action and update UI
  const persistSale = async (transaction) => {
    // Build saleData in shape expected by your server action
    const saleData = {
      items: (transaction.items || []).map(it => ({
        productId: it.productId || it.id || undefined,
        title: it.title ?? it.name ?? "",
        quantity: Number(it.quantity || 1),
        price: Number(it.salePrice ?? it.price ?? it.itemPrice ?? 0),
        originalItemPrice: Number(it.originalItemPrice ?? it.itemPrice ?? 0),
        originalPurchasePrice: Number(it.originalPurchasePrice ?? it.purchasePrice ?? 0),
      })),
      subtotal: Number(transaction.subtotal || 0),
      tax: Number(transaction.tax || 0),
      total: Number(transaction.total || 0),
      paymentMethod: transaction.paymentMethod || "cash",
      amountPaid: Number(transaction.amountPaid || 0),
      change: Number(transaction.change || 0),
      customer: transaction.customer ? {
        id: transaction.customer.id,
        name: transaction.customer.name,
        email: transaction.customer.email,
        phone: transaction.customer.phone,
        address: transaction.customer.address,
      } : undefined,
      notes: transaction.notes || undefined,
      // sellerId: optionally pass here if you cannot resolve from session on server
    };

    const saved = await createSaleAction(saleData);
    return saved;
  };

  // Process sale (now async): either accept a customTransaction (constructed by CartSection)
  // or use cart state to build the transaction.
  const processSale = async (paymentMethod, amountPaid, customTransaction = null) => {
    // If a custom transaction was provided (CartSection builds this), persist it
    if (customTransaction) {
      try {
        const savedSale = await persistSale(customTransaction);

        // create a UI-friendly transaction object (timestamp etc)
        const uiTx = {
          id: savedSale.id,
          timestamp: savedSale.createdAt ? new Date(savedSale.createdAt).toLocaleString() : new Date().toLocaleString(),
          items: savedSale.items,
          subtotal: savedSale.subtotal,
          tax: savedSale.tax,
          total: savedSale.total,
          paymentMethod: savedSale.paymentMethod,
          amountPaid: savedSale.amountPaid,
          change: savedSale.change,
          customer: savedSale.customer,
          sellerId: savedSale.sellerId,
        };

        setSalesHistory(prev => [uiTx, ...prev]);
        setLastTransaction(uiTx);
        setCart([]);
        setSelectedCustomer(null);
        setShowReceipt(true);
        return;
      } catch (err) {
        console.error("Failed to persist custom transaction:", err);
        alert("Failed to save transaction. It will remain local.");
        // fallback to local behavior below
      }
    }

    // Non-custom: build transaction from current cart
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'cash' && paid < total) {
      alert('Insufficient payment amount!');
      return;
    }

    const transaction = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      items: cart.map(it => ({
        productId: it.id || undefined,
        title: it.title ?? it.name ?? "",
        quantity: it.quantity,
        price: it.itemPrice ?? 0,
        originalItemPrice: it.itemPrice ?? 0,
        originalPurchasePrice: it.purchasePrice ?? 0,
        salePrice: it.salePrice ?? it.itemPrice ?? 0,
      })),
      subtotal,
      tax,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? paid : total,
      change: paymentMethod === 'cash' ? Math.max(0, paid - total) : 0,
      customer: selectedCustomer || undefined,
    };

    // persist now
    try {
      const savedSale = await persistSale(transaction);
      const uiTx = {
        id: savedSale.id,
        timestamp: savedSale.createdAt ? new Date(savedSale.createdAt).toLocaleString() : new Date().toLocaleString(),
        items: savedSale.items,
        subtotal: savedSale.subtotal,
        tax: savedSale.tax,
        total: savedSale.total,
        paymentMethod: savedSale.paymentMethod,
        amountPaid: savedSale.amountPaid,
        change: savedSale.change,
        customer: savedSale.customer,
        sellerId: savedSale.sellerId,
      };

      setSalesHistory(prev => [uiTx, ...prev]);
      setLastTransaction(uiTx);
      setCart([]);
      setSelectedCustomer(null);
      setShowReceipt(true);
      return;
    } catch (err) {
      console.error("Failed to persist sale:", err);
      alert("Failed to save transaction. It will remain local.");

      // fallback: keep existing behavior (store locally)
      setSalesHistory(prev => [transaction, ...prev]);
      setLastTransaction(transaction);
      setCart([]);
      setSelectedCustomer(null);
      setShowReceipt(true);
    }
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
          processSale={processSale} // now async; CartSection does not need to await
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

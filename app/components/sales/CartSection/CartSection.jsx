'use client';

import React, { useState } from 'react';
import './CartSection.css';

const formatPKR = (amount) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(amount || 0));

const CartSection = ({
  cart,
  selectedCustomer,
  setSelectedCustomer,
  setUserModalMode,
  updateQuantity,
  removeFromCart,
  clearCart,

  processSale
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  // Track sale prices for each cart item
  const [salePrices, setSalePrices] = useState({});
  const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0);
  const TAX_RATE_SAFE = Number.isFinite(TAX_RATE) ? TAX_RATE : 0;

  // friendly tax label for UI: "8%" or "0.5%" etc.
  const taxPercentLabel = `${+(TAX_RATE_SAFE * 100).toFixed(2).replace(/\.00$/, '')}%`;

  // Update sale price for an item
  const updateSalePrice = (itemId, salePrice) => {
    const price = parseFloat(salePrice) || 0;
    setSalePrices(prev => ({
      ...prev,
      [itemId]: price
    }));
  };

  // Get sale price for an item (fallback to itemPrice if not set)
  const getSalePrice = (item) => {
    return salePrices[item.id] || item.itemPrice || 0;
  };

  // Calculate unit price (units * itemsPerUnit * itemPrice)
  const calculateUnitPrice = (item) => {
    const itemsPerUnit = Number(item.itemsPerUnit) || 0;
    const itemPrice = Number(item.itemPrice) || 0;
    return itemsPerUnit * itemPrice;
  };

  // Override the calculation functions to use sale prices
  const calculateSubtotalWithSalePrices = () => {
    return cart.reduce((sum, item) => {
      const salePrice = getSalePrice(item);
      return sum + (salePrice * item.quantity);
    }, 0);
  };

  const calculateTaxWithSalePrices = (subtotal) => {
    // tax rate is a decimal (e.g. 0.08 for 8%). fallback to 0 if invalid.
    const rate = TAX_RATE_SAFE;
    return +(subtotal * rate);
  };

  const calculateTotalWithSalePrices = () => {
    const subtotal = calculateSubtotalWithSalePrices();
    const tax = calculateTaxWithSalePrices(subtotal);
    return subtotal + tax;
  };

  const calculateChangeWithSalePrices = (amountPaid) => {
    const total = calculateTotalWithSalePrices();
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  };

  // Derived values
  const subtotal = Number(calculateSubtotalWithSalePrices() || 0);
  const tax = Number(calculateTaxWithSalePrices(subtotal) || 0);
  const total = Number(calculateTotalWithSalePrices() || 0);
  const change = paymentMethod === 'cash' ? Number(calculateChangeWithSalePrices(amountPaid) || 0) : 0;
  const paid = parseFloat(amountPaid) || 0;

  // derived: is cash payment sufficient?
  const isCashSufficient = () => {
    if (paymentMethod !== 'cash') return true;
    return paid >= total;
  };

  // pending button enabled only when amount paid < total AND customer selected AND cart not empty
  const isPendingAllowed = () => {
    return cart.length > 0 && paid < total && !!selectedCustomer;
  };

  // handlePaymentSubmit now accepts desiredStatus ('completed' or 'pending')
  const handlePaymentSubmit = (desiredStatus = 'completed') => {
    // If pending, ensure there's a selected customer (defensive)
    if (desiredStatus === 'pending' && !selectedCustomer) {
      alert('Please select a customer before saving a sale as pending.');
      return;
    }

    // Create cart with sale prices for processing
    const cartWithSalePrices = cart.map(item => ({
      ...item,
      salePrice: getSalePrice(item),
      // Keep original price info for internal tracking
      originalItemPrice: item.itemPrice,
      originalPurchasePrice: item.purchasePrice
    }));
    
    // Override the processSale to use our calculations
    processSaleWithCustomPrices(paymentMethod, amountPaid, cartWithSalePrices, desiredStatus);
    // Only clear UI payment fields for 'completed' or 'pending' as appropriate
    setAmountPaid('');
    setSalePrices({});
  };

  const processSaleWithCustomPrices = (paymentMethod, amountPaid, cartWithSalePrices, status = 'completed') => {
    if (cartWithSalePrices.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const subtotalLocal = cartWithSalePrices.reduce((sum, item) => sum + (Number(item.salePrice || 0) * item.quantity), 0);
    const taxLocal = +(subtotalLocal * TAX_RATE_SAFE);
    const totalLocal = subtotalLocal + taxLocal;
    const paidLocal = parseFloat(amountPaid) || 0;

    // if user clicks "Complete Sale" and payment is insufficient, block (same as before)
    if (status === 'completed' && paymentMethod === 'cash' && paidLocal < totalLocal) {
      alert('Insufficient payment amount for a completed sale!');
      return;
    }

    // if user clicks "Pending" ensure customer exists (defensive)
    if (status === 'pending' && !selectedCustomer) {
      alert('Pending sales require a selected customer.');
      return;
    }

    const transaction = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      items: cartWithSalePrices.map(item => ({
        ...item,
        price: Number(item.salePrice || 0), // Use sale price as the transaction price
        salePrice: Number(item.salePrice || 0)
      })),
      subtotal: subtotalLocal,
      tax: taxLocal,
      total: totalLocal,
      paymentMethod: paymentMethod,
      amountPaid: paymentMethod === 'cash' ? paidLocal : totalLocal,
      change: paymentMethod === 'cash' ? Math.max(0, paidLocal - totalLocal) : 0,
      customer: selectedCustomer || undefined,
      status // attach status: 'completed' | 'pending'
    };

    // Call the parent's processSale with our custom transaction (parent persists)
    processSale(paymentMethod, amountPaid, transaction);
  };

  return (
    <div className="cart-section">
      <div className="cart-card">
        <div className="cart-header">
          <h2 className="cart-title">
            <svg style={{ marginRight: 8 }} className="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Shopping Cart ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button className="cart-clear-btn" onClick={clearCart} type="button">
              Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <p className="cart-empty-subtitle">Add products to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <div className="cart-item-info">
                    <h6 className="cart-item-name">{item.title ?? item.name}</h6>
                    
                    {/* Purchase Price Info - Internal View */}
                    <div className="cart-item-purchase-info">
                      <p className="cart-purchase-detail">
                        📦 Item Cost: {formatPKR(item.itemPrice)}
                      </p>
                      <p className="cart-purchase-detail">
                        📋 Unit Cost: {formatPKR(calculateUnitPrice(item))}
                      </p>
                    </div>

                    {/* Sale Price Input */}
                    <div className="cart-sale-price-input">
                      <label className="cart-sale-label">Sale Price per Item:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="cart-sale-input"
                        placeholder={`Default: ${formatPKR(item.itemPrice)}`}
                        value={salePrices[item.id] || ''}
                        onChange={(e) => updateSalePrice(item.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-quantity-controls">
                      <button 
                        className="cart-quantity-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="cart-quantity">{item.quantity}</span>
                      <button 
                        className="cart-quantity-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      {formatPKR(getSalePrice(item) * item.quantity)}
                    </div>
                    <button 
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      type="button"
                      aria-label={`Remove ${item.title ?? item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Selection */}
        <div className="cart-customer-section">
          <label className="cart-label">Customer (Optional)</label>
          <div className="cart-customer-controls">
            <div className="cart-customer-display">
              {selectedCustomer ? (
                <span className="cart-selected-customer">{selectedCustomer.name}</span>
              ) : (
                <span className="cart-no-customer">No customer selected</span>
              )}
            </div>
            <div className="cart-customer-buttons">
              <button 
                className="cart-customer-btn"
                onClick={() => setUserModalMode('select')}
                type="button"
              >
                Select
              </button>
              <button 
                className="cart-customer-btn"
                onClick={() => setUserModalMode('create')}
                type="button"
              >
                New
              </button>
              {selectedCustomer && (
                <>
                  <button 
                    className="cart-customer-btn"
                    onClick={() => setUserModalMode('edit')}
                    type="button"
                  >
                    Edit
                  </button>
                  <button 
                    className="cart-customer-btn cart-remove-customer"
                    onClick={() => setSelectedCustomer(null)}
                    type="button"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax ({taxPercentLabel}):</span>
              <span>{formatPKR(tax)}</span>
            </div>
            <div className="cart-summary-row cart-total-row">
              <span>Total:</span>
              <span>{formatPKR(total)}</span>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {cart.length > 0 && (
          <div className="cart-payment">
            <div className="cart-payment-method">
              <label className="cart-label">Payment Method</label>
              <select
                className="cart-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital">Digital Wallet</option>
              </select>
            </div>

            {paymentMethod === 'cash' && (
              <div className="cart-cash-payment">
                <label className="cart-label">Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  className="cart-input"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                {amountPaid !== '' && (
                  <div className="cart-change">
                    Change: <span className="cart-change-amount">{formatPKR(change)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="cart-payment-buttons">
              <button 
                className="cart-checkout-btn"
                onClick={() => handlePaymentSubmit('completed')}
                disabled={paymentMethod === 'cash' && !isCashSufficient()}
                type="button"
              >
                Complete Sale
              </button>

              <button
                className="cart-pending-btn"
                onClick={() => handlePaymentSubmit('pending')}
                disabled={!isPendingAllowed()}
                type="button"
                title={selectedCustomer ? '' : 'Pending sales require a selected customer'}
              >
                Save as Pending
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSection;

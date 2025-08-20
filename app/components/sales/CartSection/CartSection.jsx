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
    return subtotal * 0.08; // 8% tax rate
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

  const handlePaymentSubmit = () => {
    // Create cart with sale prices for processing
    const cartWithSalePrices = cart.map(item => ({
      ...item,
      salePrice: getSalePrice(item),
      // Keep original price info for internal tracking
      originalItemPrice: item.itemPrice,
      originalPurchasePrice: item.purchasePrice
    }));
    
    // Override the processSale to use our calculations
    processSaleWithCustomPrices(paymentMethod, amountPaid, cartWithSalePrices);
    setAmountPaid('');
    setSalePrices({});
  };

  const processSaleWithCustomPrices = (paymentMethod, amountPaid, cartWithSalePrices) => {
    if (cartWithSalePrices.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const subtotal = calculateSubtotalWithSalePrices();
    const tax = calculateTaxWithSalePrices(subtotal);
    const total = subtotal + tax;
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'cash' && paid < total) {
      alert('Insufficient payment amount!');
      return;
    }

    const transaction = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      items: cartWithSalePrices.map(item => ({
        ...item,
        price: getSalePrice(item), // Use sale price as the transaction price
        salePrice: getSalePrice(item)
      })),
      subtotal: subtotal,
      tax: tax,
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: paymentMethod === 'cash' ? paid : total,
      change: paymentMethod === 'cash' ? calculateChangeWithSalePrices(amountPaid) : 0,
      customer: selectedCustomer || undefined
    };

    // Call the parent's processSale but with our custom transaction
    processSale(paymentMethod, amountPaid, transaction);
  };

  const subtotal = Number(calculateSubtotalWithSalePrices() || 0);
  const tax = Number(calculateTaxWithSalePrices(subtotal) || 0);
  const total = Number(calculateTotalWithSalePrices() || 0);
  const change = paymentMethod === 'cash' ? Number(calculateChangeWithSalePrices(amountPaid) || 0) : 0;

  // derived: is cash payment sufficient?
  const isCashSufficient = () => {
    if (paymentMethod !== 'cash') return true;
    const paid = parseFloat(amountPaid) || 0;
    return paid >= total;
  };

  return (
    <div className="cart-section">
      <div className="cart-card">
        <div className="cart-header">
          <h2 className="cart-title">
            <svg className="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Shopping Cart ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button className="cart-clear-btn" onClick={clearCart} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg className="cart-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
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
              <span>Tax (8%):</span>
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

            <button 
              className="cart-checkout-btn"
              onClick={handlePaymentSubmit}
              disabled={paymentMethod === 'cash' && !isCashSufficient()}
              type="button"
            >
              <svg className="cart-checkout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Complete Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSection;
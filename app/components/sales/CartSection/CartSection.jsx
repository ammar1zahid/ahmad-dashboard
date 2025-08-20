'use client';

import React, { useState } from 'react';
import './CartSection.css';

const CartSection = ({
  cart,
  selectedCustomer,
  setSelectedCustomer,
  setUserModalMode,
  updateQuantity,
  removeFromCart,
  clearCart,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateChange,
  processSale
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const handlePaymentSubmit = () => {
    processSale(paymentMethod, amountPaid);
    setAmountPaid('');
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();
  const change = paymentMethod === 'cash' ? calculateChange(amountPaid) : 0;

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
            <button className="cart-clear-btn" onClick={clearCart}>
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
                <div className="cart-item-info">
                  <h6 className="cart-item-name">{item.name}</h6>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-quantity-controls">
                    <button 
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="cart-quantity">{item.quantity}</span>
                    <button 
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  <button 
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
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
              >
                Select
              </button>
              <button 
                className="cart-customer-btn"
                onClick={() => setUserModalMode('create')}
              >
                New
              </button>
              {selectedCustomer && (
                <>
                  <button 
                    className="cart-customer-btn"
                    onClick={() => setUserModalMode('edit')}
                  >
                    Edit
                  </button>
                  <button 
                    className="cart-customer-btn cart-remove-customer"
                    onClick={() => setSelectedCustomer(null)}
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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row cart-total-row">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
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
                {amountPaid && (
                  <div className="cart-change">
                    Change: <span className="cart-change-amount">${change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <button 
              className="cart-checkout-btn"
              onClick={handlePaymentSubmit}
              disabled={paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)}
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
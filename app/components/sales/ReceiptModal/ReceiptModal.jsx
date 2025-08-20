'use client';

import React from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-header">
          <h2 className="receipt-modal-title">
            <svg className="receipt-modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Transaction Receipt
          </h2>
          <div className="receipt-modal-actions">
            <button className="receipt-modal-btn receipt-modal-btn-print" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button className="receipt-modal-btn receipt-modal-btn-close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
        </div>

        <div className="receipt-modal-content">
          <div className="receipt-paper">
            {/* Receipt Header */}
            <div className="receipt-header">
              <h1 className="receipt-business-name">Point of Sale System</h1>
              <p className="receipt-business-info">Your Business Address</p>
              <p className="receipt-business-info">Phone: (555) 123-4567</p>
              <div className="receipt-divider"></div>
            </div>

            {/* Transaction Info */}
            <div className="receipt-transaction-info">
              <div className="receipt-info-row">
                <span className="receipt-info-label">Transaction ID:</span>
                <span className="receipt-info-value">#{transaction.id}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Date & Time:</span>
                <span className="receipt-info-value">{formatDate(transaction.timestamp)}</span>
              </div>
              {transaction.customer && (
                <div className="receipt-info-row">
                  <span className="receipt-info-label">Customer:</span>
                  <span className="receipt-info-value">{transaction.customer.name}</span>
                </div>
              )}
              <div className="receipt-info-row">
                <span className="receipt-info-label">Payment Method:</span>
                <span className="receipt-info-value receipt-payment-method">
                  {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                </span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            {/* Items */}
            <div className="receipt-items">
              <div className="receipt-items-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div className="receipt-items-divider"></div>
              
              {transaction.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <span className="receipt-item-name">{item.name}</span>
                  <span className="receipt-item-qty">{item.quantity}</span>
                  <span className="receipt-item-price">${item.price.toFixed(2)}</span>
                  <span className="receipt-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-divider"></div>

            {/* Totals */}
            <div className="receipt-totals">
              <div className="receipt-total-row">
                <span className="receipt-total-label">Subtotal:</span>
                <span className="receipt-total-value">${transaction.subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row">
                <span className="receipt-total-label">Tax (8%):</span>
                <span className="receipt-total-value">${transaction.tax.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row receipt-grand-total">
                <span className="receipt-total-label">Total:</span>
                <span className="receipt-total-value">${transaction.total.toFixed(2)}</span>
              </div>
              
              {transaction.paymentMethod === 'cash' && (
                <>
                  <div className="receipt-divider-small"></div>
                  <div className="receipt-total-row">
                    <span className="receipt-total-label">Amount Paid:</span>
                    <span className="receipt-total-value">${transaction.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="receipt-total-row">
                    <span className="receipt-total-label">Change:</span>
                    <span className="receipt-total-value">${transaction.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="receipt-divider"></div>

            {/* Footer */}
            <div className="receipt-footer">
              <p className="receipt-footer-text">Thank you for your business!</p>
              <p className="receipt-footer-text">Please keep this receipt for your records</p>
              <div className="receipt-footer-contact">
                <p>Questions? Contact us at support@yourstore.com</p>
              </div>
            </div>

            {/* Barcode Placeholder */}
            <div className="receipt-barcode">
              <div className="receipt-barcode-lines">
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line thick"></div>
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line thick"></div>
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line thick"></div>
                <div className="receipt-barcode-line"></div>
                <div className="receipt-barcode-line"></div>
              </div>
              <p className="receipt-barcode-number">{transaction.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
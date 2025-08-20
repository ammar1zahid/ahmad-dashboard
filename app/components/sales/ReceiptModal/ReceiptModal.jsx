'use client';

import React from 'react';
import './ReceiptModal.css';

const formatPKR = (amount) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(amount || 0));

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = typeof ts === 'string' || typeof ts === 'number' ? new Date(ts) : ts;
  if (isNaN(d)) return String(ts);
  return d.toLocaleString('en-PK');
};

const ReceiptModal = ({ transaction = {}, onClose = () => {} }) => {
  const handlePrint = () => {
    window.print();
  };

  // Normalize items: ensure price & quantity exist
  const items = Array.isArray(transaction.items) ? transaction.items : [];

  const normalizedItems = items.map((item) => {
    const name = item.title ?? item.name ?? item.productTitle ?? 'Item';
    const qty = Math.max(0, safeNum(item.quantity));
    const price = safeNum(item.price ?? item.itemSalePrice ?? item.itemPrice ?? item.purchasePrice ?? 0);
    return { ...item, name, quantity: qty, price, lineTotal: price * qty };
  });

  // If subtotal/tax/total provided, use them; otherwise compute
  const computedSubtotal =
    safeNum(transaction.subtotal) ||
    normalizedItems.reduce((s, it) => s + it.lineTotal, 0);

  // Use provided tax if any, else compute 8%
  const computedTax = safeNum(transaction.tax) || +(computedSubtotal * 0.08).toFixed(2);

  const computedTotal = safeNum(transaction.total) || +(computedSubtotal + computedTax).toFixed(2);

  const amountPaid = safeNum(transaction.amountPaid);
  const change = safeNum(transaction.change) || (amountPaid > computedTotal ? +(amountPaid - computedTotal).toFixed(2) : 0);

  const txId = transaction.id ?? transaction._id ?? Date.now();
  const timestamp = transaction.timestamp ?? transaction.createdAt ?? new Date().toISOString();
  const paymentMethod = (transaction.paymentMethod ?? 'unknown').toString();

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
            <button className="receipt-modal-btn receipt-modal-btn-print" onClick={handlePrint} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button className="receipt-modal-btn receipt-modal-btn-close" onClick={onClose} type="button">
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
            {/* Header */}
            <div className="receipt-header">
              <h1 className="receipt-business-name">Point of Sale System</h1>
              <p className="receipt-business-info">Your Business Address</p>
              <p className="receipt-business-info">Phone: (555) 123-4567</p>
              <div className="receipt-divider" />
            </div>

            {/* Transaction Info */}
            <div className="receipt-transaction-info">
              <div className="receipt-info-row">
                <span className="receipt-info-label">Transaction ID:</span>
                <span className="receipt-info-value">#{String(txId)}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Date & Time:</span>
                <span className="receipt-info-value">{formatDate(timestamp)}</span>
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
                  {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                </span>
              </div>
            </div>

            <div className="receipt-divider" />

            {/* Items */}
            <div className="receipt-items">
              <div className="receipt-items-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div className="receipt-items-divider" />

              {normalizedItems.length > 0 ? (
                normalizedItems.map((item, idx) => (
                  <div key={idx} className="receipt-item">
                    <span className="receipt-item-name">{item.name}</span>
                    <span className="receipt-item-qty">{item.quantity}</span>
                    <span className="receipt-item-price">{formatPKR(item.price)}</span>
                    <span className="receipt-item-total">{formatPKR(item.lineTotal)}</span>
                  </div>
                ))
              ) : (
                <div className="receipt-item">
                  <span className="receipt-item-name">No items</span>
                </div>
              )}
            </div>

            <div className="receipt-divider" />

            {/* Totals */}
            <div className="receipt-totals">
              <div className="receipt-total-row">
                <span className="receipt-total-label">Subtotal:</span>
                <span className="receipt-total-value">{formatPKR(computedSubtotal)}</span>
              </div>
              <div className="receipt-total-row">
                <span className="receipt-total-label">Tax (8%):</span>
                <span className="receipt-total-value">{formatPKR(computedTax)}</span>
              </div>
              <div className="receipt-total-row receipt-grand-total">
                <span className="receipt-total-label">Total:</span>
                <span className="receipt-total-value">{formatPKR(computedTotal)}</span>
              </div>

              {paymentMethod === 'cash' && (
                <>
                  <div className="receipt-divider-small" />
                  <div className="receipt-total-row">
                    <span className="receipt-total-label">Amount Paid:</span>
                    <span className="receipt-total-value">{formatPKR(amountPaid)}</span>
                  </div>
                  <div className="receipt-total-row">
                    <span className="receipt-total-label">Change:</span>
                    <span className="receipt-total-value">{formatPKR(change)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="receipt-divider" />

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
              <p className="receipt-barcode-number">{String(txId)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

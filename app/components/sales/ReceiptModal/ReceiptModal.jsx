'use client';

import React from 'react';
import './ReceiptModal.css';
import Image from 'next/image';

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

const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0);

  // Print only the .bill-paper by injecting it into a hidden iframe
const handlePrint = () => {
  try {
    const contentEl = document.querySelector('.bill-paper');
    if (!contentEl) return window.print();

    // create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"><title>Print Receipt</title></head><body></body></html>');
    doc.close();

    // clone stylesheet link and style nodes from parent document head
    const head = doc.head;
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      try {
        head.appendChild(node.cloneNode(true));
      } catch (err) {
        // fallback: create a link when clone fails (rare)
        if (node.tagName.toLowerCase() === 'link' && node.href) {
          const l = doc.createElement('link');
          l.rel = 'stylesheet';
          l.href = node.href;
          head.appendChild(l);
        }
      }
    });

    // copy the bill content
    // use outerHTML to preserve inline attributes and structure
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = contentEl.outerHTML;
    // ensure body contains only the bill so it prints alone
    doc.body.innerHTML = '';
    doc.body.appendChild(wrapper);

    // wait for images and fonts to load inside iframe, then print
    const imgs = doc.images;
    if (imgs && imgs.length) {
      let loaded = 0;
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        if (img.complete) {
          loaded++;
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded === imgs.length) {
              setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                // remove iframe after printing
                setTimeout(() => document.body.removeChild(iframe), 500);
              }, 100);
            }
          };
        }
      }
      // if already loaded
      if (loaded === imgs.length) {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => document.body.removeChild(iframe), 500);
        }, 100);
      }
    } else {
      // no images — print right away
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 500);
      }, 150);
    }
  } catch (err) {
    console.error('Iframe print error, falling back to window.print()', err);
    window.print();
  }
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
  const computedTax = safeNum(transaction.tax) || +(computedSubtotal * (Number.isFinite(TAX_RATE) ? TAX_RATE : 0)).toFixed(2);

  const computedTotal = safeNum(transaction.total) || +(computedSubtotal + computedTax).toFixed(2);

  const amountPaid = safeNum(transaction.amountPaid);
  const change = safeNum(transaction.change) || (amountPaid > computedTotal ? +(amountPaid - computedTotal).toFixed(2) : 0);

  const txId = transaction.id ?? transaction._id ?? Date.now();
  const timestamp = transaction.timestamp ?? transaction.createdAt ?? new Date().toISOString();
  const paymentMethod = (transaction.paymentMethod ?? 'unknown').toString();

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bill-modal-header">
          <h2 className="bill-modal-title">
            <svg className="bill-modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Bill / رسید
          </h2>
          <div className="bill-modal-actions">
            <button className="bill-modal-btn bill-modal-btn-print" onClick={handlePrint} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button className="bill-modal-btn bill-modal-btn-close" onClick={onClose} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
        </div>

        <div className="bill-modal-content">
          <div className="bill-paper">
            {/* Header with Logo/Business Info */}
            <div className="bill-header">
              <div className="bill-logo-section">
                {/* Replace 'logo.png' with your actual header image path */}

                  <Image
                    src="/logo.png"
                    alt="Business Header"
                    className="bill-header-image"
                    width={600}
                    height={120}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                    priority
                  />
                {/* Fallback header if image fails to load */}
                <div className="bill-header-fallback" style={{display: 'none'}}>
                  <h1 className="bill-business-name">آپ کا کاروبار</h1>
                  <p className="bill-business-name-english">YOUR BUSINESS NAME</p>
                  <p className="bill-business-info">Shop # 123, Main Market, Multan</p>
                  <p className="bill-business-info">Ph: 0300-1234567 | NTN: 1234567-8</p>
                </div>
              </div>
            </div>

            {/* Bill Title and Info */}
            <div className="bill-title-section">
              <h2 className="bill-title">CASH MEMO / نقد رسید</h2>
              <div className="bill-number-date">
                <div className="bill-info-item">
                  <span className="bill-label">Bill No:</span>
                  <span className="bill-value">#{String(txId).slice(-6)}</span>
                </div>
                <div className="bill-info-item">
                  <span className="bill-label">Date:</span>
                  <span className="bill-value">{formatDate(timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bill-customer-section">
              <div className="bill-customer-row">
                <span className="bill-customer-label">Customer Name / کسٹمر کا نام:</span>
                <span className="bill-customer-value">{transaction.customer?.name || 'Walk-in Customer'}</span>
              </div>
              {transaction.customer?.phone && (
                <div className="bill-customer-row">
                  <span className="bill-customer-label">Phone / فون:</span>
                  <span className="bill-customer-value">{transaction.customer.phone}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="bill-items-section">
              <table className="bill-items-table">
                <thead>
                  <tr className="bill-table-header">
                    <th className="bill-th-sr">Sr#</th>
                    <th className="bill-th-description">Description / تفصیل</th>
                    <th className="bill-th-qty">Qty</th>
                    <th className="bill-th-rate">Rate</th>
                    <th className="bill-th-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedItems.length > 0 ? (
                    normalizedItems.map((item, idx) => (
                      <tr key={idx} className="bill-table-row">
                        <td className="bill-td-sr">{idx + 1}</td>
                        <td className="bill-td-description">{item.name}</td>
                        <td className="bill-td-qty">{item.quantity}</td>
                        <td className="bill-td-rate">{formatPKR(item.price)}</td>
                        <td className="bill-td-amount">{formatPKR(item.lineTotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bill-table-row">
                      <td className="bill-td-sr">1</td>
                      <td className="bill-td-description">No items</td>
                      <td className="bill-td-qty">-</td>
                      <td className="bill-td-rate">-</td>
                      <td className="bill-td-amount">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="bill-totals-section">
              <div className="bill-totals-table">
                <div className="bill-total-row">
                  <span className="bill-total-label">Sub Total:</span>
                  <span className="bill-total-value">{formatPKR(computedSubtotal)}</span>
                </div>
                <div className="bill-total-row">
                  <span className="bill-total-label">Tax :</span>
                  <span className="bill-total-value">{formatPKR(computedTax)}</span>
                </div>
                <div className="bill-total-row bill-grand-total">
                  <span className="bill-total-label">TOTAL AMOUNT:</span>
                  <span className="bill-total-value">{formatPKR(computedTotal)}</span>
                </div>

                {paymentMethod === 'cash' && (
                  <>
                    <div className="bill-total-row">
                      <span className="bill-total-label">Cash Received:</span>
                      <span className="bill-total-value">{formatPKR(amountPaid)}</span>
                    </div>
                    <div className="bill-total-row">
                      <span className="bill-total-label">Change Return:</span>
                      <span className="bill-total-value">{formatPKR(change)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bill-payment-section">
              <div className="bill-payment-method">
                <span className="bill-payment-label">Payment Method / ادائیگی کا طریقہ:</span>
                <span className="bill-payment-value">
                  {paymentMethod.toUpperCase()} / 
                  {paymentMethod === 'cash' ? ' نقد' : paymentMethod === 'card' ? ' کارڈ' : ' دیگر'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bill-footer">
              <div className="bill-footer-thanks">
                <p className="bill-thanks-english">Thank you for your business!</p>
                <p className="bill-thanks-urdu">آپ کا شکریہ!</p>
              </div>
              <div className="bill-footer-note">
                <p>All goods sold are not returnable</p>
                <p>تمام فروخت شدہ اشیاء واپس نہیں ہوں گی</p>
              </div>
              <div className="bill-signature-section">
                <div className="bill-signature">
                  <div className="bill-signature-line"></div>
                  <p className="bill-signature-label">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
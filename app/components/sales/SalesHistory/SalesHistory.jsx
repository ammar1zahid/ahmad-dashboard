'use client';

import React, { useState } from 'react';
import './SalesHistory.css';

const formatPKR = (amount) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(amount || 0));

const safeNum = (v) => Number(v ?? 0);

const SalesHistory = ({ salesHistory = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };

  const displayedTransactions = isExpanded ? salesHistory : salesHistory.slice(0, 5);

  return (
    <div className="sales-history">
      <div className="sales-history-card">
        <div className="sales-history-header">
          <h2 className="sales-history-title">
            <svg className="sales-history-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Sales History ({salesHistory.length})
          </h2>
          {salesHistory.length > 5 && (
            <button
              className="sales-history-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
            >
              {isExpanded ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>

        <div className="sales-history-content">
          {salesHistory.length === 0 ? (
            <div className="sales-history-empty">
              <svg className="sales-history-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <p>No sales recorded yet</p>
              <p className="sales-history-empty-subtitle">Transactions will appear here after your first sale</p>
            </div>
          ) : (
            <div className="sales-history-list">
              {displayedTransactions.map(transaction => {
                const txId = transaction.id ?? transaction._id ?? Date.now();
                const timestamp = transaction.timestamp ?? transaction.createdAt ?? new Date().toLocaleString();
                const total = safeNum(transaction.total);
                const subtotal = safeNum(transaction.subtotal);
                const tax = safeNum(transaction.tax);
                const paymentMethod = transaction.paymentMethod ?? 'unknown';
                const customerName = transaction.customer?.name ?? transaction.customer?.title ?? '';

                return (
                  <div key={String(txId)} className="sales-history-item">
                    <div
                      className="sales-history-item-header"
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleTransactionDetails(txId)}
                      onKeyDown={(e) => { if (e.key === 'Enter') toggleTransactionDetails(txId); }}
                    >
                      <div className="sales-history-item-info">
                        <div className="sales-history-item-meta">
                          <span className="sales-history-item-id">#{String(txId)}</span>
                          <span className="sales-history-item-time">{String(timestamp)}</span>
                        </div>
                        {customerName && (
                          <div className="sales-history-customer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>{customerName}</span>
                          </div>
                        )}
                      </div>

                      <div className="sales-history-item-summary">
                        <div className="sales-history-item-total">{formatPKR(total)}</div>
                        <div className="sales-history-item-payment">
                          <span className={`sales-history-payment-badge ${paymentMethod}`}>
                            {paymentMethod}
                          </span>
                        </div>
                      </div>

                      <button
                        className="sales-history-expand-btn"
                        type="button"
                        aria-expanded={expandedTransaction === txId}
                        aria-controls={`tx-${String(txId)}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={expandedTransaction === txId ? 'rotated' : ''}
                        >
                          <polyline points="6,9 12,15 18,9"/>
                        </svg>
                      </button>
                    </div>

                    {expandedTransaction === txId && (
                      <div id={`tx-${String(txId)}`} className="sales-history-item-details">
                        <div className="sales-history-items-list">
                          <h4 className="sales-history-items-title">Items:</h4>
                          {Array.isArray(transaction.items) && transaction.items.length > 0 ? (
                            transaction.items.map(item => {
                              const itemName = item.title ?? item.name ?? item.productTitle ?? 'Item';
                              const itemQty = safeNum(item.quantity);
                              const itemPrice = safeNum(item.price);
                              return (
                                <div key={String(item.id ?? `${itemName}-${Math.random()}`)} className="sales-history-item-row">
                                  <span className="sales-history-item-name">
                                    {itemName} x{itemQty}
                                  </span>
                                  <span className="sales-history-item-price">
                                    {formatPKR(itemPrice * itemQty)}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="sales-history-item-row">
                              <span className="sales-history-item-name">No items</span>
                            </div>
                          )}
                        </div>

                        <div className="sales-history-breakdown">
                          <div className="sales-history-breakdown-row">
                            <span>Subtotal:</span>
                            <span>{formatPKR(subtotal)}</span>
                          </div>
                          <div className="sales-history-breakdown-row">
                            <span>Tax:</span>
                            <span>{formatPKR(tax)}</span>
                          </div>
                          <div className="sales-history-breakdown-row sales-history-total-row">
                            <span>Total:</span>
                            <span>{formatPKR(total)}</span>
                          </div>

                          {paymentMethod === 'cash' && (
                            <>
                              <div className="sales-history-breakdown-row">
                                <span>Amount Paid:</span>
                                <span>{formatPKR(safeNum(transaction.amountPaid))}</span>
                              </div>
                              <div className="sales-history-breakdown-row">
                                <span>Change:</span>
                                <span>{formatPKR(safeNum(transaction.change))}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;

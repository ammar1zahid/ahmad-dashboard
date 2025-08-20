'use client';

import React, { useState } from 'react';
import './SalesHistory.css';

const SalesHistory = ({ salesHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
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
              {displayedTransactions.map(transaction => (
                <div key={transaction.id} className="sales-history-item">
                  <div 
                    className="sales-history-item-header"
                    onClick={() => toggleTransactionDetails(transaction.id)}
                  >
                    <div className="sales-history-item-info">
                      <div className="sales-history-item-meta">
                        <span className="sales-history-item-id">#{transaction.id}</span>
                        <span className="sales-history-item-time">{transaction.timestamp}</span>
                      </div>
                      {transaction.customer && (
                        <div className="sales-history-customer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {transaction.customer.name}
                        </div>
                      )}
                    </div>
                    <div className="sales-history-item-summary">
                      <div className="sales-history-item-total">${transaction.total.toFixed(2)}</div>
                      <div className="sales-history-item-payment">
                        <span className={`sales-history-payment-badge ${transaction.paymentMethod}`}>
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <button className="sales-history-expand-btn">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={expandedTransaction === transaction.id ? 'rotated' : ''}
                      >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                  </div>

                  {expandedTransaction === transaction.id && (
                    <div className="sales-history-item-details">
                      <div className="sales-history-items-list">
                        <h4 className="sales-history-items-title">Items:</h4>
                        {transaction.items.map(item => (
                          <div key={item.id} className="sales-history-item-row">
                            <span className="sales-history-item-name">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="sales-history-item-price">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="sales-history-breakdown">
                        <div className="sales-history-breakdown-row">
                          <span>Subtotal:</span>
                          <span>${transaction.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="sales-history-breakdown-row">
                          <span>Tax:</span>
                          <span>${transaction.tax.toFixed(2)}</span>
                        </div>
                        <div className="sales-history-breakdown-row sales-history-total-row">
                          <span>Total:</span>
                          <span>${transaction.total.toFixed(2)}</span>
                        </div>
                        {transaction.paymentMethod === 'cash' && (
                          <>
                            <div className="sales-history-breakdown-row">
                              <span>Amount Paid:</span>
                              <span>${transaction.amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="sales-history-breakdown-row">
                              <span>Change:</span>
                              <span>${transaction.change.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
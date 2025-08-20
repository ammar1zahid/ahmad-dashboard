'use client';

import React from 'react';
import './QuickStats.css';

const QuickStats = ({ salesHistory, customers }) => {
  // Calculate stats
  const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = salesHistory.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Today's stats
  const today = new Date().toDateString();
  const todaysSales = salesHistory.filter(sale => 
    new Date(sale.timestamp).toDateString() === today
  );
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const todaysTransactions = todaysSales.length;

  // Most popular payment method
  const paymentMethods = salesHistory.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  
  const mostPopularPayment = Object.entries(paymentMethods).length > 0 
    ? Object.entries(paymentMethods).sort(([,a], [,b]) => b - a)[0][0]
    : 'N/A';

  // Best selling items
  const itemSales = salesHistory.reduce((acc, sale) => {
    sale.items.forEach(item => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
    });
    return acc;
  }, {});

  const bestSellingItem = Object.entries(itemSales).length > 0
    ? Object.entries(itemSales).sort(([,a], [,b]) => b - a)[0][0]
    : 'No items sold';

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: 'green',
      subtitle: `${totalTransactions} total transactions`
    },
    {
      title: 'Today\'s Revenue',
      value: `$${todaysRevenue.toFixed(2)}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: 'blue',
      subtitle: `${todaysTransactions} transactions today`
    },
    {
      title: 'Average Sale',
      value: `$${averageTransaction.toFixed(2)}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
      color: 'purple',
      subtitle: 'Per transaction'
    },
    {
      title: 'Total Customers',
      value: customers.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: 'orange',
      subtitle: 'Registered customers'
    },
    {
      title: 'Popular Payment',
      value: mostPopularPayment.charAt(0).toUpperCase() + mostPopularPayment.slice(1),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: 'indigo',
      subtitle: 'Most used method'
    },
    {
      title: 'Best Seller',
      value: bestSellingItem,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,11 12,14 22,4"/>
          <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11"/>
        </svg>
      ),
      color: 'teal',
      subtitle: 'Top selling item'
    }
  ];

  return (
    <div className="quick-stats">
      <div className="quick-stats-header">
        <h2 className="quick-stats-title">
          <svg className="quick-stats-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Quick Stats
        </h2>
      </div>
      
      <div className="quick-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`quick-stats-card ${stat.color}`}>
            <div className="quick-stats-card-header">
              <div className={`quick-stats-card-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="quick-stats-card-content">
                <h3 className="quick-stats-card-title">{stat.title}</h3>
                <div className="quick-stats-card-value">{stat.value}</div>
                <p className="quick-stats-card-subtitle">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
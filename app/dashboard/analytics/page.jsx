import { fetchSales } from "@/app/lib/data";
import styles from "../../components/analytics/analytics.module.css";

const AnalyticsPage = async ({ searchParams }) => {
  const params = await searchParams;
  const q = params?.q || "";
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 100; // Get more data for analytics
  
  const { sales = [] } = (await fetchSales({ q, page, limit })) || {};

  // Calculate analytics data
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0);
  
  // Payment method distribution
  const paymentMethods = sales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  // Top selling items
  const itemsMap = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const key = item.title || 'Unknown Item';
      if (!itemsMap[key]) {
        itemsMap[key] = { title: key, quantity: 0, revenue: 0 };
      }
      itemsMap[key].quantity += item.quantity;
      itemsMap[key].revenue += item.price * item.quantity;
    });
  });
  
  const topItems = Object.values(itemsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Seller performance analytics
  const sellersMap = {};
  sales.forEach(sale => {
    if (sale.seller) {
      const sellerId = sale.seller.id;
      const sellerName = sale.seller.username || 'Unknown Seller';
      
      if (!sellersMap[sellerId]) {
        sellersMap[sellerId] = {
          id: sellerId,
          name: sellerName,
          email: sale.seller.email,
          isAdmin: sale.seller.isAdmin,
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        };
      }
      
      sellersMap[sellerId].totalSales += 1;
      sellersMap[sellerId].totalRevenue += sale.total;
    }
  });

  // Calculate average order values for sellers
  Object.values(sellersMap).forEach(seller => {
    seller.averageOrderValue = seller.totalSales > 0 ? seller.totalRevenue / seller.totalSales : 0;
  });

  const topSellers = Object.values(sellersMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Sales by date (last 7 days)
  const salesByDate = {};
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
    salesByDate[dateStr] = { count: 0, revenue: 0 };
  }

  sales.forEach(sale => {
    if (sale.createdAt) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      if (salesByDate[saleDate]) {
        salesByDate[saleDate].count += 1;
        salesByDate[saleDate].revenue += sale.total;
      }
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sales Analytics</h1>
        <p className={styles.subtitle}>
          Comprehensive overview of your sales performance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💰</div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricValue}>${totalRevenue.toFixed(2)}</h3>
            <p className={styles.metricLabel}>Total Revenue</p>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📊</div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricValue}>{totalSales}</h3>
            <p className={styles.metricLabel}>Total Sales</p>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💳</div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricValue}>${averageOrderValue.toFixed(2)}</h3>
            <p className={styles.metricLabel}>Average Order Value</p>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🏷️</div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricValue}>${totalTax.toFixed(2)}</h3>
            <p className={styles.metricLabel}>Total Tax Collected</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Sales Trend Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Sales Trend (Last 7 Days)</h2>
          <div className={styles.chartContainer}>
            <div className={styles.barChart}>
              {last7Days.map(date => {
                const data = salesByDate[date];
                const maxRevenue = Math.max(...Object.values(salesByDate).map(d => d.revenue));
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 200 : 0;
                
                return (
                  <div key={date} className={styles.barGroup}>
                    <div 
                      className={styles.bar}
                      style={{ height: `${height}px` }}
                      title={`$${data.revenue.toFixed(2)}`}
                    ></div>
                    <span className={styles.barLabel}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Payment Methods</h2>
          <div className={styles.pieChart}>
            {Object.entries(paymentMethods).length > 0 ? (
              Object.entries(paymentMethods).map(([method, count]) => {
                const percentage = ((count / totalSales) * 100).toFixed(1);
                return (
                  <div key={method} className={styles.pieItem}>
                    <div className={styles.pieColor}></div>
                    <span className={styles.pieLabel}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                    <span className={styles.pieValue}>{percentage}%</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.noData}>No payment data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Sellers */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Top Performing Sellers</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Seller</div>
            <div className={styles.tableCell}>Total Sales</div>
            <div className={styles.tableCell}>Total Revenue</div>
            <div className={styles.tableCell}>Avg Order Value</div>
            <div className={styles.tableCell}>Role</div>
          </div>
          {topSellers.length > 0 ? (
            topSellers.map((seller) => (
              <div key={seller.id} className={styles.tableRow}>
                <div className={styles.tableCell} data-label="Seller">
                  <div className={styles.sellerInfo}>
                    <span className={styles.sellerName}>{seller.name}</span>
                    <span className={styles.sellerEmail}>{seller.email}</span>
                  </div>
                </div>
                <div className={styles.tableCell} data-label="Total Sales">
                  {seller.totalSales}
                </div>
                <div className={styles.tableCell} data-label="Total Revenue">
                  ${seller.totalRevenue.toFixed(2)}
                </div>
                <div className={styles.tableCell} data-label="Avg Order Value">
                  ${seller.averageOrderValue.toFixed(2)}
                </div>
                <div className={styles.tableCell} data-label="Role">
                  <span className={`${styles.role} ${seller.isAdmin ? styles.admin : styles.seller}`}>
                    {seller.isAdmin ? 'Admin' : 'Seller'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>No seller data available</div>
          )}
        </div>
      </div>

      {/* Top Selling Items */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Top Selling Items</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Item</div>
            <div className={styles.tableCell}>Quantity Sold</div>
            <div className={styles.tableCell}>Revenue</div>
          </div>
          {topItems.length > 0 ? (
            topItems.map((item, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.tableCell} data-label="Item">
                  {item.title}
                </div>
                <div className={styles.tableCell} data-label="Quantity Sold">
                  {item.quantity}
                </div>
                <div className={styles.tableCell} data-label="Revenue">
                  ${item.revenue.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>No items data available</div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Recent Sales</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Date</div>
            <div className={styles.tableCell}>Items</div>
            <div className={styles.tableCell}>Payment</div>
            <div className={styles.tableCell}>Total</div>
            <div className={styles.tableCell}>Status</div>
          </div>
          {sales.length > 0 ? (
            sales.slice(0, 10).map((sale) => (
              <div key={sale.id} className={styles.tableRow}>
                <div className={styles.tableCell} data-label="Date">
                  {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className={styles.tableCell} data-label="Items">
                  {sale.items.length}
                </div>
                <div className={styles.tableCell} data-label="Payment">
                  {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                </div>
                <div className={styles.tableCell} data-label="Total">
                  ${sale.total.toFixed(2)}
                </div>
                <div className={styles.tableCell} data-label="Status">
                  <span className={`${styles.status} ${styles[sale.status]}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>No sales data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
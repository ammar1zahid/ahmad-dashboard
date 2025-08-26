import Card from '../components/dashboard/card/card'
import Chart from '../components/dashboard/chart/chart'
import styles from '../components/dashboard/dashboard.module.css'
import Rightbar from '../components/dashboard/rightbar/rightbar'
import Transactions from '../components/dashboard/transactions/transactions'
import { fetchSales } from "@/app/lib/data";

export const dynamic = "force-dynamic";

async function Dashboard() {
  // fetch a decent number of sales for analytics
  const { sales = [] } = (await fetchSales({ page: 1, limit: 200 })) || {};

  // Basic metrics
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;


  // Build last 14 days map (we'll use last 7 vs previous 7 to compute percent change)
  const dateMap = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dateMap[key] = { revenue: 0, count: 0 };
  }

  sales.forEach(sale => {
    if (!sale.createdAt) return;
    const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
    if (dateMap[saleDate]) {
      dateMap[saleDate].revenue += Number(sale.total || 0);
      dateMap[saleDate].count += 1;
    }
  });

  // build arrays for last 7 and previous 7
  const allDates = Object.keys(dateMap).sort(); // oldest -> newest
  const prev7Dates = allDates.slice(0, 7);
  const last7Dates = allDates.slice(7, 14);

  const prev7Revenue = prev7Dates.reduce((sum, d) => sum + dateMap[d].revenue, 0);
  const last7Revenue = last7Dates.reduce((sum, d) => sum + dateMap[d].revenue, 0);

  const revenueChangePercent =
    prev7Revenue > 0 ? ((last7Revenue - prev7Revenue) / prev7Revenue) * 100 : 0;

  // cards array in same shape as original dummy but with real values
  const cards = [
    {
      id: 1,
      title: "Total Revenue",
      number: Number(totalRevenue.toFixed(2)),
      change: Number(revenueChangePercent.toFixed(1)),
    },
    {
      id: 2,
      title: "Total Sales",
      number: totalSales,
      change: 0,
    },
    {
      id: 3,
      title: "Average Order Value",
      number: Number(averageOrderValue.toFixed(2)),
      change: 0,
    },
  ];

  // prepare trendData for Chart (last 7 days -> labels + revenue)
  const trendData = last7Dates.map(d => {
    const dt = new Date(d);
    return {
      name: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: Number(dateMap[d].revenue.toFixed(2)),
      date: d,
    };
  });

  // recent sales for transactions component (most recent first)
  const recentSales = sales
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          {cards.map((item) => (
            <Card item={item} key={item.id} />
          ))}
        </div>

        <Transactions recentSales={recentSales} />

        <Chart trendData={trendData} />
      </div>

      <div className={styles.side}>
        <Rightbar />
      </div>
    </div>
  );
}

export default Dashboard;

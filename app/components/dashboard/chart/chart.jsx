"use client"

import styles from './chart.module.css'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Chart = ({ trendData = [] }) => {
  // trendData is an array like: [{ name: 'Mon', revenue: 123.45, date: '2025-08-19' }, ...]
  // provide a small fallback if no data
  const data = (trendData.length > 0)
    ? trendData
    : [
        { name: "Sun", revenue: 0 },
        { name: "Mon", revenue: 0 },
        { name: "Tue", revenue: 0 },
        { name: "Wed", revenue: 0 },
        { name: "Thu", revenue: 0 },
        { name: "Fri", revenue: 0 },
        { name: "Sat", revenue: 0 },
      ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Weekly Revenue</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip contentStyle={{ background: "#151c2c", border: "none" }} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart

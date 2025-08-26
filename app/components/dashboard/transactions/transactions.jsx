import Image from "next/image";
import styles from "./transactions.module.css";

const Transactions = ({ recentSales = [] }) => {
  // Helper to map status to class (keep your CSS class names)
  const statusClass = (status) => {
    if (!status) return styles.pending;
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'done') return styles.done || styles.pending;
    if (s === 'cancelled') return styles.cancelled;
    if (s === 'pending') return styles.pending;
    return styles.pending;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Latest Transactions</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Status</td>
            <td>Date</td>
            <td>Amount</td>
          </tr>
        </thead>
        <tbody>
          {recentSales.length > 0 ? (
            recentSales.map((sale) => {
              const name = sale.customer?.name || "Walk-in";
              const status = sale.status || "pending";
              const date = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A";
              const amount = Number(sale.amountPaid ?? sale.total ?? 0).toFixed(2);

              return (
                <tr key={String(sale.id || sale._id || `${name}-${date}`)}>
                  <td>
                    <div className={styles.user}>
                      <Image
                        src="/noavatar.png"
                        alt=""
                        width={40}
                        height={40}
                        className={styles.userImage}
                      />
                      {name}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${statusClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td>{date}</td>
                  <td>Rs{amount}</td>
                </tr>
              );
            })
          ) : (
            // fallback rows (keeps UI from being empty)
            <>
              <tr>
                <td>
                  <div className={styles.user}>
                    <Image src="/noavatar.png" alt="" width={40} height={40} className={styles.userImage} />
                    John Doe
                  </div>
                </td>
                <td><span className={`${styles.status} ${styles.pending}`}>Pending</span></td>
                <td>14.02.2024</td>
                <td>$3,200</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;

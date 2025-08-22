// app/dashboard/transactions/page.jsx
export const dynamic = "force-dynamic";

import Search from "@/app/components/dashboard/search/search";
import styles from "../../components/transactions/transactions.module.css";
import Link from "next/link";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchSales } from "@/app/lib/data";
import { deleteSaleFromModal } from "@/app/lib/actions"; // wrapper action that accepts FormData

// Helper function to get status style class
function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return styles.statusCompleted;
    case 'pending':
      return styles.statusPending;
    case 'cancelled':
      return styles.statusCancelled;
    case 'refunded':
      return styles.statusRefunded;
    default:
      return styles.statusCompleted; // default fallback
  }
}

async function TransactionsPage({ searchParams }) {
  try {
    const params = await searchParams;
    const q = params?.q || "";
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;

    const { count = 0, sales = [] } = (await fetchSales({ q, page, limit })) || {};

    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <Search placeholder="Search transactions (customer, payment, notes)..." />
          <Link href="/dashboard/sales">
            <button className={styles.addButton}>New Transaction</button>
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((sale) => {
                const id = String(sale.id ?? "");
                const created = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "";
                const customerName = sale.customer?.name ?? "Walk-in";
                const itemsCount = Array.isArray(sale.items) ? sale.items.length : 0;
                const status = sale.status || "completed";

                return (
                  <tr key={id}>
                    <td>
                      <span className={styles.txnId}>
                        {id.slice(0, 8)}...
                      </span>
                    </td>
                    <td>{customerName}</td>
                    <td>
                      <span className={styles.itemsCount}>
                        {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amount}>
                        ${sale.amountPaid?.toFixed ? sale.amountPaid.toFixed(2) : Number(sale.amountPaid || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>{(sale.paymentMethod || "").toString()}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td>{created}</td>
                    <td>
                      <div className={styles.buttons}>
                        <Link href={`/dashboard/transactions/${id}`}>
                          <button className={`${styles.button} ${styles.view}`}>View</button>
                        </Link>

                        <form action={deleteSaleFromModal} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={id} />
                          <button 
                            type="submit"
                            className={`${styles.button} ${styles.delete}`}
                            aria-label={`Delete transaction ${id.slice(0,8)}`}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className={styles.noData}>
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering TransactionsPage:", error);
    return (
      <div className={styles.container}>
        <p style={{ color: "red", textAlign: "center", padding: "20px" }}>
          Failed to load transactions. Please try again later.
        </p>
      </div>
    );
  }
}

export default TransactionsPage;

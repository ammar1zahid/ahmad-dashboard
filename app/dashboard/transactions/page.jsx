// app/dashboard/transactions/page.jsx
export const dynamic = "force-dynamic";

import Search from "@/app/components/dashboard/search/search";
import styles from "../../components/dashboard/users/users.module.css";
import Link from "next/link";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchSales } from "@/app/lib/data";
import { deleteSaleFromModal } from "@/app/lib/actions"; // wrapper action that accepts FormData

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
              <td>Txn ID</td>
              <td>Customer</td>
              <td>Items</td>
              <td>Total</td>
              <td>Payment</td>
              <td>Created At</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((sale) => {
                const id = String(sale.id ?? "");
                const created = sale.createdAt ? new Date(sale.createdAt).toString().slice(4, 16) : "";
                const customerName = sale.customer?.name ?? "Walk-in";
                const itemsCount = Array.isArray(sale.items) ? sale.items.length : 0;

                return (
                  <tr key={id}>
                    <td>{id.slice(0, 8)}</td>
                    <td>{customerName}</td>
                    <td>{itemsCount}</td>
                    <td>{sale.amountPaid?.toFixed ? sale.amountPaid.toFixed(2) : Number(sale.amountPaid || 0).toFixed(2)}</td>
                    <td>{(sale.paymentMethod || "").toString()}</td>
                    <td>{created}</td>
                    <td>
                      <div className={styles.buttons}>
                        <Link href={`/dashboard/transactions/${id}`}>
                          <button className={`${styles.button} ${styles.view}`}>View</button>
                        </Link>

                        <form action={deleteSaleFromModal}>
                          <input type="hidden" name="id" value={id} />
                          <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
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
        <p style={{ color: "red" }}>Failed to load transactions.</p>
      </div>
    );
  }
}

export default TransactionsPage;

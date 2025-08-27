// app/dashboard/transactions/page.jsx
export const dynamic = "force-dynamic";

import Search from "@/app/components/dashboard/search/search";
import styles from "../../components/transactions/transactions.module.css";
import Link from "next/link";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchSales } from "@/app/lib/data";
import { deleteSaleFromModal } from "@/app/lib/actions";
import AdminOnly from "../../components/dashboard/auth/AdminOnly";

// Helper function to get status style class
function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case "completed":
      return styles.statusCompleted;
    case "pending":
      return styles.statusPending;
    case "cancelled":
      return styles.statusCancelled;
    case "refunded":
      return styles.statusRefunded;
    default:
      return styles.statusCompleted; // default fallback
  }
}

async function TransactionsPage({ searchParams }) {
  try {
    const params = await searchParams;
    // Basic search/paging params
    const q = params?.q || "";
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;

    // New filter params (read from query string)
    const status = params?.status || ""; // e.g. completed, pending
    const paymentMethod = params?.paymentMethod || "";
    const sellerId = params?.sellerId || "";
    const dateFrom = params?.dateFrom || ""; // ISO date or yyyy-mm-dd
    const dateTo = params?.dateTo || "";
    const minAmount = params?.minAmount || "";
    const maxAmount = params?.maxAmount || "";
    const sortBy = params?.sortBy || "createdAt"; // createdAt | amountPaid | total
    const sortOrder = params?.sortOrder || "desc"; // asc | desc

    const { count = 0, sales = [] } =
      (await fetchSales({
        q,
        page,
        limit,
        sellerId: sellerId || null,
        status: status || null,
        paymentMethod: paymentMethod || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        minAmount: minAmount ? Number(minAmount) : null,
        maxAmount: maxAmount ? Number(maxAmount) : null,
        sortBy,
        sortOrder,
      })) || {};

    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <Search placeholder="Search transactions (customer, payment, notes)..." />
          <Link href="/dashboard/sales">
            <button className={styles.addButton}>New Transaction</button>
          </Link>
        </div>

        {/* Filters form — GET so it updates searchParams */}

        <form method="get" className={styles.filtersForm}>
          <div className={styles.filtersHeader}>
            <h3 className={styles.filtersTitle}>Filter Transactions</h3>
          </div>

          <div className={styles.filtersContainer}>
            {/* Search Input */}
            {/* <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Search</label>
              <div className={styles.searchContainer}>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search transactions (customer, payment, notes)..."
                  className={`${styles.input} ${styles.searchInput}`}
                />
              </div>
            </div> */}

            {/* Status Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                name="status"
                defaultValue={status || ""}
                className={styles.select}
              >
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Payment Method</label>
              <input
                name="paymentMethod"
                defaultValue={paymentMethod}
                placeholder="e.g., Credit Card, Cash"
                className={styles.input}
              />
            </div>

            {/* Seller ID */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Seller ID</label>
              <input
                name="sellerId"
                defaultValue={sellerId}
                placeholder="Enter seller ID"
                className={styles.input}
              />
            </div>

            {/* Date Range */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Date Range</label>
              <div className={styles.dateRangeGroup}>
                <input
                  name="dateFrom"
                  defaultValue={dateFrom}
                  type="date"
                  className={styles.input}
                  title="From date"
                />
                <input
                  name="dateTo"
                  defaultValue={dateTo}
                  type="date"
                  className={styles.input}
                  title="To date"
                />
              </div>
            </div>

            {/* Amount Range */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Amount Range</label>
              <div className={styles.amountRangeGroup}>
                <input
                  name="minAmount"
                  defaultValue={minAmount}
                  placeholder="Min Rs"
                  className={styles.input}
                  type="number"
                  step="0.01"
                />
                <input
                  name="maxAmount"
                  defaultValue={maxAmount}
                  placeholder="Max Rs"
                  className={styles.input}
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <div className={styles.sortGroup}>
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className={styles.select}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="amountPaid">Amount Paid</option>
                  <option value="total">Total Amount</option>
                </select>
                <select
                  name="sortOrder"
                  defaultValue={sortOrder}
                  className={styles.select}
                >
                  <option value="desc">↓ Desc</option>
                  <option value="asc">↑ Asc</option>
                </select>
              </div>
            </div>

            {/* Results Per Page */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Per Page</label>
              <select
                name="limit"
                defaultValue={String(limit)}
                className={styles.select}
              >
                <option value="5">5 results</option>
                <option value="10">10 results</option>
                <option value="20">20 results</option>
                <option value="50">50 results</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.filterActions}>
            <button
              type="submit"
              className={`${styles.button} ${styles.applyButton}`}
            >
              Apply Filters
            </button>
            <Link href="/dashboard/transactions">
              <button
                type="button"
                className={`${styles.button} ${styles.resetButton}`}
              >
                Clear All
              </button>
            </Link>
          </div>

          {/* Active Filters Display (Optional Enhancement) */}
          {(q ||
            status ||
            paymentMethod ||
            sellerId ||
            dateFrom ||
            dateTo ||
            minAmount ||
            maxAmount) && (
            <div className={styles.activeFilters}>
              {q && <span className={styles.filterTag}>Search: {q}</span>}
              {status && (
                <span className={styles.filterTag}>Status: {status}</span>
              )}
              {paymentMethod && (
                <span className={styles.filterTag}>
                  Payment: {paymentMethod}
                </span>
              )}
              {sellerId && (
                <span className={styles.filterTag}>Seller: {sellerId}</span>
              )}
              {dateFrom && (
                <span className={styles.filterTag}>From: {dateFrom}</span>
              )}
              {dateTo && <span className={styles.filterTag}>To: {dateTo}</span>}
              {minAmount && (
                <span className={styles.filterTag}>Min: ${minAmount}</span>
              )}
              {maxAmount && (
                <span className={styles.filterTag}>Max: ${maxAmount}</span>
              )}
            </div>
          )}
        </form>

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
                const created = sale.createdAt
                  ? new Date(sale.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                const customerName = sale.customer?.name ?? "Walk-in";
                const itemsCount = Array.isArray(sale.items)
                  ? sale.items.length
                  : 0;
                const statusVal = sale.status || "completed";

                return (
                  <tr key={id}>
                    <td>
                      <span className={styles.txnId}>{id.slice(0, 8)}...</span>
                    </td>
                    <td>{customerName}</td>
                    <td>
                      <span className={styles.itemsCount}>
                        {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amount}>
                        Rs
                        {sale.amountPaid?.toFixed
                          ? sale.amountPaid.toFixed(2)
                          : Number(sale.amountPaid || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>{(sale.paymentMethod || "").toString()}</td>
                    <td>
                      <span
                        className={`${styles.status} ${getStatusClass(
                          statusVal
                        )}`}
                      >
                        {statusVal}
                      </span>
                    </td>
                    <td>{created}</td>
                    <td>
                      <div className={styles.buttons}>
                        <AdminOnly hide={false}>
                          <Link href={`/dashboard/transactions/${id}`}>
                            <button
                              className={`${styles.button} ${styles.view}`}
                            >
                              View
                            </button>
                          </Link>
                        </AdminOnly>
                        <AdminOnly hide={false}>
                          <form
                            action={deleteSaleFromModal}
                            style={{ display: "inline" }}
                          >
                            <input type="hidden" name="id" value={id} />
                            <button
                              type="submit"
                              className={`${styles.button} ${styles.delete}`}
                              aria-label={`Delete transaction ${id.slice(
                                0,
                                8
                              )}`}
                            >
                              Delete
                            </button>
                          </form>
                        </AdminOnly>
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

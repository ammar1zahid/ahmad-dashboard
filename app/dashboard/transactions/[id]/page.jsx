// app/dashboard/transactions/[id]/page.jsx
import { fetchSale } from "@/app/lib/data";
import { updateSaleFromModal } from "@/app/lib/actions";
import styles from "../../../components/dashboard/sales/transactionPage.module.css";
import Link from "next/link";

const SingleTransactionPage = async (props) => {
  const params = await props.params;
  const { id } = params;
  const sale = await fetchSale(id);

  if (!sale) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>Transaction Not Found</h2>
          <p>The requested transaction could not be found.</p>
        </div>
      </div>
    );
  }

  // sale fields are serialized already
  const sid = sale.id || "";
  const createdAt = sale.createdAt ? new Date(sale.createdAt) : null;
  const updatedAt = sale.updatedAt ? new Date(sale.updatedAt) : null;
  const paymentMethod = sale.paymentMethod ?? "";
  const amountPaid = Number(sale.amountPaid ?? 0);
  const change = Number(sale.change ?? 0);
  const subtotal = Number(sale.subtotal ?? 0);
  const tax = Number(sale.tax ?? 0);
  const total = Number(sale.total ?? 0);
  const customer = sale.customer ?? null;
  const notes = sale.notes ?? "";
  const items = sale.items || [];

  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  const averageItemPrice =
    items.length > 0
      ? items.reduce((sum, item) => sum + Number(item.price || 0), 0) /
        items.length
      : 0;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: { label: "Cash", icon: "💵" },
      card: { label: "Card", icon: "💳" },
      digital: { label: "Digital", icon: "📱" },
      other: { label: "Other", icon: "💰" },
    };
    return methods[method] || { label: method, icon: "💰" };
  };

  const paymentDisplay = getPaymentMethodDisplay(paymentMethod);

  return (
    <div className={styles.container}>
      {/* Header */}

      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard/transactions" className={styles.backLink}>
            ← Back to Transactions
          </Link>
        </div>
        <div className={styles.headerContent}>
          <h1>Transaction Details</h1>
          <div className={styles.transactionId}>ID: {sid}</div>
        </div>
        <div className={styles.statusBadge}>
          <span className={styles.statusText}>Completed</span>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Summary */}
        <div className={styles.summaryCard}>
          <h2>Transaction Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Amount</span>
              <span className={styles.summaryValue}>
                {formatCurrency(total)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Amount Paid</span>
              <span className={styles.summaryValue}>
                {formatCurrency(amountPaid)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Change Given</span>
              <span className={styles.summaryValue}>
                {formatCurrency(change)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Payment Method</span>
              <span className={styles.summaryValue}>
                {paymentDisplay.icon} {paymentDisplay.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className={styles.customerCard}>
          <h2>Customer Information</h2>
          <div className={styles.customerInfo}>
            <div className={styles.customerAvatar}>
              {customer?.name ? customer.name.charAt(0).toUpperCase() : "👤"}
            </div>
            <div className={styles.customerDetails}>
              <div className={styles.customerName}>
                {customer?.name || "Walk-in Customer"}
              </div>
              {customer?.email && (
                <div className={styles.customerEmail}>{customer.email}</div>
              )}
              {customer?.phone && (
                <div className={styles.customerPhone}>{customer.phone}</div>
              )}
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className={styles.financialCard}>
          <h2>Financial Breakdown</h2>
          <div className={styles.financialBreakdown}>
            <div className={styles.breakdownRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Tax Rate</span>
              <span>
                {subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className={`${styles.breakdownRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsCard}>
          <h2>Transaction Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{totalItems}</div>
              <div className={styles.statLabel}>Total Items</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{items.length}</div>
              <div className={styles.statLabel}>Unique Products</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {formatCurrency(averageItemPrice)}
              </div>
              <div className={styles.statLabel}>Avg. Item Price</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className={styles.itemsCard}>
          <h2>Items Purchased</h2>
          <div className={styles.tableContainer}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Original Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const title =
                    item.title || `Product ${item.productId || idx + 1}`;
                  const qty = Number(item.quantity || 0);
                  const price = Number(item.price || 0);
                  const originalPrice = Number(item.originalItemPrice || price);
                  const lineTotal = qty * price;
                  const hasDiscount = originalPrice > price;

                  return (
                    <tr key={idx} className={styles.itemRow}>
                      <td className={styles.productCell}>
                        <div className={styles.productInfo}>
                          <span className={styles.productName}>{title}</span>
                          {item.productId && (
                            <span className={styles.productId}>
                              ID: {item.productId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.quantityCell}>
                        <span className={styles.quantityBadge}>{qty}</span>
                      </td>
                      <td className={styles.priceCell}>
                        <div className={styles.priceInfo}>
                          <span className={styles.currentPrice}>
                            {formatCurrency(price)}
                          </span>
                          {hasDiscount && (
                            <span className={styles.discount}>
                              {(
                                ((originalPrice - price) / originalPrice) *
                                100
                              ).toFixed(0)}
                              % off
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.originalPriceCell}>
                        <span
                          className={
                            hasDiscount
                              ? styles.originalPrice
                              : styles.regularPrice
                          }
                        >
                          {formatCurrency(originalPrice)}
                        </span>
                      </td>
                      <td className={styles.totalCell}>
                        <strong>{formatCurrency(lineTotal)}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timelineCard}>
          <h2>Transaction Timeline</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>📅</div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineLabel}>Created</div>
                <div className={styles.timelineValue}>
                  {formatDate(createdAt)}
                </div>
              </div>
            </div>
            {updatedAt &&
              createdAt &&
              updatedAt.getTime() !== createdAt.getTime() && (
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>🔄</div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineLabel}>Last Updated</div>
                    <div className={styles.timelineValue}>
                      {formatDate(updatedAt)}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Edit form (server-side inline form, no client handlers) */}
        <div className={styles.editCard}>
          <h2>Edit Transaction</h2>

          {/* Update form */}
          <form action={updateSaleFromModal} className={styles.editForm}>
            <input type="hidden" name="id" value={sid} />

            <div className={styles.formGroup}>
              <label htmlFor="paymentMethod" className={styles.label}>
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                defaultValue={paymentMethod}
                className={styles.select}
              >
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="digital">📱 Digital</option>
                <option value="other">💰 Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amountPaid" className={styles.label}>
                Amount Paid
              </label>
              <input
                type="number"
                id="amountPaid"
                step="0.01"
                name="amountPaid"
                defaultValue={amountPaid}
                className={styles.input}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={notes}
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.updateBtn}>
                💾 Update Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SingleTransactionPage;

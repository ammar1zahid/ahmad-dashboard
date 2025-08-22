import styles from "../../../../components/customers/customerSales.module.css";
import { fetchSalesByCustomer } from "@/app/lib/data";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export default async function CustomerSalesPage({ params, searchParams }) {
  const pparams = await params;
  const sparams = await searchParams;
  const customerId = pparams.id;
  const q = sparams?.q || "";
  const page = Number(sparams?.page) || 1;
  const limit = Number(sparams?.limit) || 10;

  const { count = 0, sales = [] } =
    (await fetchSalesByCustomer(customerId, { q, page, limit })) || {};

  const customer = sales.length > 0 ? sales[0].customer : null;
  const totalPages = Math.ceil(count / limit);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Customer Sales History</h1>
        {customer && (
          <div className={styles.customerInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Customer Name</div>
              <div className={styles.infoValue}>{customer.name}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>{customer.email || "N/A"}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Phone</div>
              <div className={styles.infoValue}>{customer.phone || "N/A"}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Address</div>
              <div className={styles.infoValue}>{customer.address || "N/A"}</div>
            </div>
          </div>
        )}
      </div>

      {sales.length === 0 ? (
        <div className={styles.noSales}>No sales found for this customer.</div>
      ) : (
        <div className={styles.salesGrid}>
          {sales.map((sale) => (
            <div className={styles.saleCard} key={sale.id}>
              <div className={styles.saleHeader}>
                <div className={styles.saleId}>#{sale.id}</div>
                <div
                  className={`${styles.saleStatus} ${
                    styles[`status-${sale.status}`]
                  }`}
                >
                  {sale.status}
                </div>
                <div className={styles.saleDate}>
                  {formatDate(sale.createdAt)}
                </div>
              </div>

              <div className={styles.saleItems}>
                <div className={styles.itemsHeader}>
                  Items ({sale.items.length})
                </div>
                {sale.items.map((item, idx) => (
                  <div className={styles.item} key={idx}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemDetails}>
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className={styles.itemTotal}>
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.saleSummary}>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Subtotal</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(sale.subtotal)}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Tax</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(sale.tax)}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Total</div>
                  <div
                    className={`${styles.summaryValue} ${styles.totalValue}`}
                  >
                    {formatCurrency(sale.total)}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Payment</div>
                  <div className={styles.summaryValue}>
                    {sale.paymentMethod}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Paid</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(sale.amountPaid)}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Change</div>
                  <div className={styles.summaryValue}>
                    {formatCurrency(sale.change)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && (
            <a
              href={`?q=${q}&page=${page - 1}&limit=${limit}`}
              className={styles.pageBtn}
            >
              ← Prev
            </a>
          )}
          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((p) => (
            <a
              key={p}
              href={`?q=${q}&page=${p}&limit=${limit}`}
              className={`${styles.pageBtn} ${
                p === page ? styles.active : ""
              }`}
            >
              {p}
            </a>
          ))}
          {page < totalPages && (
            <a
              href={`?q=${q}&page=${page + 1}&limit=${limit}`}
              className={styles.pageBtn}
            >
              Next →
            </a>
          )}
          <div className={styles.pageInfo}>
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

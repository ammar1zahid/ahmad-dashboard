// app/dashboard/customers/page.jsx
export const dynamic = "force-dynamic";

import Search from "@/app/components/dashboard/search/search";
import styles from "../../components/customers/customer.module.css";
import Link from "next/link";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchCustomers } from "@/app/lib/data";
import { deleteCustomer } from "@/app/lib/actions";
import AdminOnly from "../../components/dashboard/auth/AdminOnly";

async function CustomersPage({ searchParams }) {
  try {
    const params = await searchParams;
    const q = params?.q || "";
    const page = Number(params?.page) || 1;

    const { count = 0, customers = [] } = (await fetchCustomers(q, page)) || {};

    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <Search placeholder="Search for a customer" />
          <AdminOnly hide={true}>
            <Link href="/dashboard/customers/add">
              <button className={styles.addButton}>Add New</button>
            </Link>
          </AdminOnly>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Email</td>
              <td>Created At</td>
              <td>Phone</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => {
                const id = String(customer._id ?? customer.id ?? "");
                const created = customer.createdAt
                  ? new Date(customer.createdAt).toString().slice(4, 16)
                  : "";

                return (
                  <tr key={id}>
                    <td data-label="Name:">
                      <div className={styles.user}>{customer.name}</div>
                    </td>
                    <td data-label="Email:">{customer.email}</td>
                    <td data-label="Created:">{created}</td>
                    <td data-label="Phone:">{customer.phone || "-"}</td>
                    <td data-label="Actions:">
                      <div className={styles.buttons}>
                        <AdminOnly hide={false}>
                          <Link href={`/dashboard/customers/${id}`}>
                            <button
                              className={`${styles.button} ${styles.view}`}
                            >
                              View
                            </button>
                          </Link>
                        </AdminOnly>
                        <AdminOnly hide={false}>
                          <form action={deleteCustomer}>
                            <input type="hidden" name="id" value={id} />
                            <button
                              className={`${styles.button} ${styles.delete}`}
                            >
                              Delete
                            </button>
                          </form>
                        </AdminOnly>

                        <Link href={`/dashboard/customers/transactions/${id}`}>
                          <button className={`${styles.button} ${styles.view}`}>
                            View Transactions
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering CustomersPage:", error);
    return (
      <div className={styles.container}>
        <p style={{ color: "red" }}>Failed to load customers.</p>
      </div>
    );
  }
}

export default CustomersPage;

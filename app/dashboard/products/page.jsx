// app/dashboard/products/page.jsx
import Link from "next/link";
import styles from "../../components/dashboard/products/products.module.css";
import Search from "@/app/components/dashboard/search/search";
import Image from "next/image";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchProducts } from "@/app/lib/data";
import { deleteProduct } from "@/app/lib/actions";
import AdminOnly from "../../components/dashboard/auth/AdminOnly";
export const dynamic = "force-dynamic";

const ProductsPage = async ({ searchParams }) => {
  const params = await searchParams;
  const q = params?.q || "";
  const page = params?.page || 1;

  let count = 0;
  let products = [];

  try {
    const result = await fetchProducts(q, page);
    count = result?.count || 0;
    products = result?.products || [];
  } catch (err) {
    console.error("ProductsPage error:", err);
    count = 0;
    products = [];
  }

  const formatCurrency = (amount) => {
    const num = Number(amount ?? 0) || 0;
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(num);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{count}</span>
            <span className={styles.statLabel}>Total Products</span>
          </div>
        </div>
      </div>

      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <AdminOnly hide={true}>

        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>
            <span className={styles.addIcon}>+</span>
            Add New Product
          </button>
        </Link>
        </AdminOnly>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Purchase Info</th>
              <th>Inventory</th>
              <th>Pricing</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                const id = String(product._id ?? product.id ?? "");
                const created = product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString()
                  : "";

                return (
                  <tr key={id}>
                    <td>
                      <div className={styles.product}>
                        <div className={styles.productImageContainer}>
                          <Image
                            // src={product.img || "/noproduct.jpg"}
                            src={product.img || "/product.png"}
                            alt={product.title || "Product"}
                            width={50}
                            height={50}
                            className={styles.productImage}
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <h3 className={styles.productTitle}>
                            {product.title}
                          </h3>
                          <p className={styles.productDesc}>
                            {product.desc?.length > 50
                              ? `${product.desc.substring(0, 50)}...`
                              : product.desc}
                          </p>
                          {(product.color || product.size) && (
                            <div className={styles.productVariants}>
                              {product.color && (
                                <span className={styles.variant}>
                                  Color: {product.color}
                                </span>
                              )}
                              {product.size && (
                                <span className={styles.variant}>
                                  Size: {product.size}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.category} ${
                          styles[product.category] || styles.general
                        }`}
                      >
                        {product.category || "General"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.purchaseInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Total:</span>
                          <span className={styles.infoValue}>
                            {formatCurrency(product.purchasePrice)}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Per Item:</span>
                          <span className={styles.infoValue}>
                            {formatCurrency(product.itemPrice)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.inventoryInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Units:</span>
                          <span className={styles.infoValue}>
                            {product.units || 0}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Items/Unit:</span>
                          <span className={styles.infoValue}>
                            {product.itemsPerUnit || 0}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Total Items:</span>
                          <span className={styles.infoValue}>
                            {product.totalItems || 0}
                          </span>
                        </div>
                        {product.extraItems > 0 && (
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Extra:</span>
                            <span className={styles.infoValue}>
                              +{product.extraItems}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className={styles.pricingInfo}>
                        {product.itemSalePrice ? (
                          <>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}>
                                Sale Price:
                              </span>
                              <span className={styles.infoValue}>
                                {formatCurrency(product.itemSalePrice)}
                              </span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}>
                                Profit/Item:
                              </span>
                              <span
                                className={`${styles.infoValue} ${styles.profit}`}
                              >
                                {formatCurrency(
                                  Number(product.itemSalePrice ?? 0) -
                                    Number(product.itemPrice ?? 0)
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className={styles.noPrice}>
                            No sale price set
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={styles.date}>{created}</span>
                    </td>

                    <td>
                      <div className={styles.buttons}>
                        <AdminOnly hide={false}>
                          <Link href={`/dashboard/products/${id}`}>
                            <button
                              className={`${styles.button} ${styles.view}`}
                              title="View Details"
                            >
                              View
                            </button>
                          </Link>
                        </AdminOnly>
                        <AdminOnly hide={false}>
                          <Link href={`/dashboard/products/${id}`}>
                            <button
                              className={`${styles.button} ${styles.edit}`}
                              title="Edit Product"
                            >
                              Edit
                            </button>
                          </Link>
                        </AdminOnly>

                        {/* Server-action form — no client event handlers here */}
                        <AdminOnly hide={false}>
                          <form
                            action={deleteProduct}
                            className={styles.deleteForm}
                          >
                            <input type="hidden" name="id" value={id} />
                            <button
                              type="submit"
                              className={`${styles.button} ${styles.delete}`}
                              title="Delete Product"
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
                <td colSpan="8" className={styles.noData}>
                  <div className={styles.noDataContent}>
                    <span className={styles.noDataIcon}>📦</span>
                    <h3>No products found</h3>
                    <p>Get started by adding your first product</p>
                    <Link href="/dashboard/products/add">
                      <button className={styles.addButton}>
                        Add New Product
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count > 0 && <Pagination count={count} />}
    </div>
  );
};

export default ProductsPage;

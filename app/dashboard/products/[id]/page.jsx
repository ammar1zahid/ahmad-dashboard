export const dynamic = "force-dynamic";

import { updateProduct } from "@/app/lib/actions";
import { fetchProduct } from "@/app/lib/data";
import styles from "../../../components/dashboard/products/singleProduct/singleProduct.module.css";
import Link from "next/link";

const SingleProductPage = async (props) => {
  const params = await props.params;
  const { id } = params;
  const product = await fetchProduct(id);

  // Normalize primitives locally (defensive)
  const pid = String(product._id ?? product.id ?? "");
  const title = product.title ?? "";
  const purchasePrice = product.purchasePrice ?? "";
  const units = product.units ?? "";
  const itemsPerUnit = product.itemsPerUnit ?? "";
  const itemSalePrice = product.itemSalePrice ?? "";
  const category = product.category ?? "general";
  const color = product.color ?? "";
  const size = product.size ?? "";
  const desc = product.desc ?? "";
  const totalItems = product.totalItems ?? 0;
  const itemPrice = product.itemPrice ?? 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount || 0);
  };

  const getStockStatus = (totalItems, itemSalePrice) => {
    if (!totalItems || totalItems === 0)
      return { status: "out-of-stock", text: "Out of Stock" };
    if (totalItems <= 5) return { status: "low-stock", text: "Low Stock" };
    if (!itemSalePrice) return { status: "no-price", text: "No Sale Price" };
    return { status: "in-stock", text: "In Stock" };
  };

  const stockInfo = getStockStatus(totalItems, itemSalePrice);
  const profitPerItem =
    itemSalePrice && itemPrice ? itemSalePrice - itemPrice : 0;
  const totalPotentialRevenue =
    itemSalePrice && totalItems ? itemSalePrice * totalItems : 0;
  const totalPotentialProfit = profitPerItem * totalItems;

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard/products" className={styles.backLink}>
            ← Back to Products
          </Link>
        </div>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>{title}</h1>
            <span className={`${styles.status} ${styles[stockInfo.status]}`}>
              {stockInfo.text}
            </span>
          </div>
          {/* <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton}>
              Duplicate
            </button>
            <button type="button" className={styles.dangerButton}>
              Delete
            </button>
          </div> */}
        </div>
      </div>

      <div className={styles.content}>
        {/* Info Cards Section */}
        <div className={styles.infoContainer}>
          {/* Product Overview Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Product Overview</h3>
              <span
                className={`${styles.categoryBadge} ${
                  styles[category] || styles.general
                }`}
              >
                {category || "General"}
              </span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.productPlaceholder}>
                <div className={styles.placeholderIcon}>📦</div>
                <p>No image available</p>
              </div>
              <div className={styles.productDetails}>
                {color && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Color:</span>
                    <span className={styles.detailValue}>{color}</span>
                  </div>
                )}
                {size && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Size:</span>
                    <span className={styles.detailValue}>{size}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Created:</span>
                  <span className={styles.detailValue}>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Financial Overview</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.financialGrid}>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Purchase Price</span>
                  <span className={styles.financialValue}>
                    {formatCurrency(purchasePrice)}
                  </span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Cost Per Item</span>
                  <span className={styles.financialValue}>
                    {formatCurrency(itemPrice)}
                  </span>
                </div>
                {itemSalePrice && (
                  <>
                    <div className={styles.financialItem}>
                      <span className={styles.financialLabel}>Sale Price</span>
                      <span className={styles.financialValue}>
                        {formatCurrency(itemSalePrice)}
                      </span>
                    </div>
                    <div className={styles.financialItem}>
                      <span className={styles.financialLabel}>
                        Profit Per Item
                      </span>
                      <span
                        className={`${styles.financialValue} ${
                          profitPerItem >= 0 ? styles.profit : styles.loss
                        }`}
                      >
                        {formatCurrency(profitPerItem)}
                      </span>
                    </div>
                    <div className={styles.financialItem}>
                      <span className={styles.financialLabel}>
                        Total Revenue Potential
                      </span>
                      <span className={styles.financialValue}>
                        {formatCurrency(totalPotentialRevenue)}
                      </span>
                    </div>
                    <div className={styles.financialItem}>
                      <span className={styles.financialLabel}>
                        Total Profit Potential
                      </span>
                      <span
                        className={`${styles.financialValue} ${
                          totalPotentialProfit >= 0
                            ? styles.profit
                            : styles.loss
                        }`}
                      >
                        {formatCurrency(totalPotentialProfit)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Overview Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Inventory Overview</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.inventoryGrid}>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryNumber}>{units || 0}</span>
                  <span className={styles.inventoryLabel}>Units</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryNumber}>
                    {itemsPerUnit || 0}
                  </span>
                  <span className={styles.inventoryLabel}>Items/Unit</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={`${styles.inventoryNumber} ${styles.total}`}>
                    {totalItems || 0}
                  </span>
                  <span className={styles.inventoryLabel}>Total Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Section */}
        <div className={styles.formContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Edit Product</h3>
              <p>Update product information and pricing</p>
            </div>
            <div className={styles.cardContent}>
              <form action={updateProduct} className={styles.form}>
                <input type="hidden" name="id" value={pid} />

                <div className={styles.formSection}>
                  <h4>Basic Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">
                        Product Title <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={title}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="category">Category</label>
                      <select
                        name="category"
                        id="category"
                        defaultValue={category || "general"}
                      >
                        <option value="general">General</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="phone">Phone</option>
                        <option value="computer">Computer</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="color">Color</label>
                      <input
                        type="text"
                        id="color"
                        name="color"
                        defaultValue={color || ""}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="size">Size</label>
                      <input
                        type="text"
                        id="size"
                        name="size"
                        defaultValue={size || ""}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="desc">
                      Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      name="desc"
                      id="desc"
                      rows="4"
                      defaultValue={desc || ""}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Purchase & Inventory</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="purchasePrice">
                        Purchase Price (Total){" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        id="purchasePrice"
                        name="purchasePrice"
                        defaultValue={purchasePrice}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="units">
                        Units <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        id="units"
                        name="units"
                        defaultValue={units}
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="itemsPerUnit">
                        Items Per Unit{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        id="itemsPerUnit"
                        name="itemsPerUnit"
                        defaultValue={itemsPerUnit}
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Calculated Fields (Read Only)</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Total Items</label>
                      <input
                        type="text"
                        value={`${totalItems} items`}
                        readOnly
                        className={styles.readOnly}
                      />
                      <small>Units × Items per Unit + Extra Items</small>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Cost Per Item</label>
                      <input
                        type="text"
                        value={formatCurrency(itemPrice)}
                        readOnly
                        className={styles.readOnly}
                      />
                      <small>Purchase Price ÷ Total Items</small>
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <Link
                    href="/dashboard/products"
                    className={styles.cancelButton}
                  >
                    Cancel
                  </Link>
                  <button type="submit" className={styles.updateButton}>
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;

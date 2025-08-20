export const dynamic = "force-dynamic";

import { addProduct } from "@/app/lib/actions";
import styles from "../../../components/dashboard/products/addProduct/addProduct.module.css";
import Link from "next/link";

const AddProductPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add New Product</h1>
        <p>Fill in the details below to add a new product to your inventory</p>
      </div>
      
      <form action={addProduct} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Product Title <span className={styles.required}>*</span>
          </label>
          <input 
            type="text" 
            id="title"
            name="title" 
            placeholder="Enter product title"
            className={styles.input}
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <select 
            name="category" 
            id="category" 
            className={styles.select}
            defaultValue=""
            required
          >
            <option value="" disabled>Choose a Category</option>
            <option value="kitchen">Kitchen</option>
            <option value="phone">Phone</option>
            <option value="computer">Computer</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="purchasePrice" className={styles.label}>
              Purchase Price (Total) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="purchasePrice"
              name="purchasePrice"
              placeholder="0.00"
              className={styles.input}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="units" className={styles.label}>
              Units <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="units"
              name="units"
              placeholder="Number of units"
              className={styles.input}
              required
              min="1"
              step="1"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="itemsPerUnit" className={styles.label}>
              Items per Unit <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="itemsPerUnit"
              name="itemsPerUnit"
              placeholder="Items per unit"
              className={styles.input}
              required
              min="1"
              step="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="extraItems" className={styles.label}>
              Extra Items
            </label>
            <input
              type="number"
              id="extraItems"
              name="extraItems"
              placeholder="Additional items"
              className={styles.input}
              min="0"
              step="1"
              defaultValue={0}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="color" className={styles.label}>
              Color
            </label>
            <input 
              type="text" 
              id="color"
              name="color" 
              placeholder="Product color"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="size" className={styles.label}>
              Size
            </label>
            <input 
              type="text" 
              id="size"
              name="size" 
              placeholder="Product size"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="desc" className={styles.label}>
            Description <span className={styles.required}>*</span>
          </label>
          <textarea
            id="desc"
            name="desc"
            rows="6"
            placeholder="Describe the product features, specifications, and any other relevant details..."
            className={styles.textarea}
            required
          />
        </div>

        <div className={styles.buttonGroup}>
          <Link href="/dashboard/products"  className={styles.cancelButton}>
          {/* <button type="button" className={styles.cancelButton}> */}
            Cancel
          {/* </button> */}
          </Link>
          <button type="submit" className={styles.submitButton}>
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
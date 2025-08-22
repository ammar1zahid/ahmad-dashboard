// app/dashboard/transactions/EditTransactionForm.jsx
"use client";

import React from "react";
import styles from "../../components/dashboard/sales/transactionPage.module.css";
import { updateSaleFromModal, deleteSaleFromModal } from "@/app/lib/actions";

export default function EditTransactionForm({ id, paymentMethod, amountPaid, notes }) {
  // id, paymentMethod, amountPaid, notes are plain primitives (strings/numbers)
  return (
    <div className={styles.editCard}>
      <h2>Edit Transaction</h2>

      {/* Update form */}
      <form action={updateSaleFromModal} className={styles.editForm}>
        <input type="hidden" name="id" value={id} />

        <div className={styles.formGroup}>
          <label htmlFor="paymentMethod" className={styles.label}>Payment Method</label>
          <select id="paymentMethod" name="paymentMethod" defaultValue={paymentMethod} className={styles.select}>
            <option value="cash">💵 Cash</option>
            <option value="card">💳 Card</option>
            <option value="digital">📱 Digital</option>
            <option value="other">💰 Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amountPaid" className={styles.label}>Amount Paid</label>
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
          <label htmlFor="notes" className={styles.label}>Notes</label>
          <textarea id="notes" name="notes" defaultValue={notes} className={styles.textarea} rows={4} />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.updateBtn}>💾 Update Transaction</button>

          {/* Separate delete form — confirm in onClick then submit */}
          <form
            action={deleteSaleFromModal}
            className={styles.deleteForm}
            // eslint-disable-next-line no-unused-vars
            onSubmit={(e) => {
              // nothing here; confirm happens on button click
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className={styles.deleteBtn}
              onClick={(e) => {
                const ok = confirm("Are you sure you want to delete this transaction? This action cannot be undone.");
                if (!ok) e.preventDefault();
              }}
            >
              🗑️ Delete Transaction
            </button>
          </form>
        </div>
      </form>
    </div>
  );
}

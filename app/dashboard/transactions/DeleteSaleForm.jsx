// app/dashboard/transactions/DeleteSaleForm.jsx
"use client";

import React from "react";
import styles from "../../components/dashboard/sales/transactionPage.module.css";
import { deleteSaleFromModal } from "@/app/lib/actions";

export default function DeleteSaleForm({ id }) {
  return (
    <form action={deleteSaleFromModal}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={`${styles.button} ${styles.delete}`}
        onClick={(e) => {
          const ok = confirm("Are you sure you want to delete this transaction? This action cannot be undone.");
          if (!ok) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}

"use client";

import styles from "./pagination.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ count }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const page = searchParams.get("page") || 1;

  const params = new URLSearchParams(searchParams);
  const ITEM_PER_PAGE = 2;

  const hasPrev = ITEM_PER_PAGE * (parseInt(page) - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (parseInt(page) - 1) + ITEM_PER_PAGE < count;

  const handleChangePage = (type) => {
    type === "prev"
      ? params.set("page", parseInt(page) - 1)
      : params.set("page", parseInt(page) + 1);
    replace(`${pathname}?${params}`);
  };

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const currentPage = parseInt(page);

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.prevButton}`}
        disabled={!hasPrev}
        onClick={() => handleChangePage("prev")}
      >
        <span className={styles.icon}>←</span>
        Previous
      </button>
      
      <div className={styles.pageInfo}>
        <span className={styles.pageText}>
          Page <span className={styles.currentPage}>{currentPage}</span> of {totalPages}
        </span>
      </div>

      <button
        className={`${styles.button} ${styles.nextButton}`}
        disabled={!hasNext}
        onClick={() => handleChangePage("next")}
      >
        Next
        <span className={styles.icon}>→</span>
      </button>
    </div>
  );
};

export default Pagination;
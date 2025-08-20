import Image from "next/image";
import Link from "next/link";
import styles from "./rightbar.module.css";
import { MdPlayCircleFilled } from "react-icons/md";

const Rightbar = () => {
  return (
    <div className={styles.container}>
      {/* Inventory Check Call-to-Action */}
      <div className={styles.item}>
        <div className={styles.bgContainer}>
          <Image
            className={styles.bg}
            src="/astronaut.png"
            alt="Inventory Dashboard Screenshot"
            fill
          />
        </div>
        <div className={styles.text}>
          <span className={styles.notification}>🔍 Inventory Overview</span>
          <h3 className={styles.title}>
            Check Your Product Inventory
          </h3>
          <span className={styles.subtitle}>
            See current stock levels at a glance
          </span>
          <p className={styles.desc}>
            Quickly review quantities, statuses, and warehouse locations
            for all your products—stay ahead of restocking needs.
          </p>
          <Link href="/dashboard/products">
            <button className={styles.button}>
              <MdPlayCircleFilled />
              Go to Products
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Rightbar;

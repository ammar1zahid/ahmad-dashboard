// Footer Component (footer.jsx)
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}> Ahmad Traders</div>
        <div className={styles.text}>© 2025 All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
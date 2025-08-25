// Footer Component (footer.jsx)
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>Ammar Zahid</div>
        <div className={styles.text}>© 2024 All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <a
            href="https://www.instagram.com/tintin_elegant_mart"
            target="blank"
            className={styles.socialBtn}
          >
            <img
              src="/instagram-icon.svg"
              alt="Instagram"
              className={styles.socialIcon}
            />
            Instagram
          </a>
          <a
            href="https://www.facebook.com/share/1Bzh7jmkdF/?mibextid=wwXIfr"
            target="blank"
            className={styles.socialBtn}
          >
            <img
              src="/facebook-icon.svg"
              alt="Facebook"
              className={styles.socialIcon}
            />
            Facebook
          </a>
          <a
            href="https://wa.me/+2349162992638"
            target='blank'
            className={styles.socialBtn}
          >
            <img
              src="/whatsapp-icon.svg"
              alt="WhatsApp"
              className={styles.socialIcon}
            />
            WhatsApp
          </a>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} TinTin Elegant Mart. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

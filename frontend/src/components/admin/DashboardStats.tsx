import styles from "../../pages/Dashboard.module.css";

type DashboardOverview = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
};

type DashboardStatsProps = {
  stats: DashboardOverview;
};

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <section className={styles.statsGrid}>
      <article className={styles.statCard}>
        <span>Total users</span>
        <strong>{stats.totalUsers}</strong>
      </article>
      <article className={styles.statCard}>
        <span>Total products</span>
        <strong>{stats.totalProducts}</strong>
      </article>
      <article className={styles.statCard}>
        <span>Total orders</span>
        <strong>{stats.totalOrders}</strong>
      </article>
    </section>
  );
};

export default DashboardStats;

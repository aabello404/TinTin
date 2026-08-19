import styles from "../../pages/Dashboard.module.css";

type DashboardCategory = {
  name: string;
  _count: {
    id: number;
  };
};

type CategoryPerformanceProps = {
  categories: DashboardCategory[];
};

const CategoryPerformance = ({ categories }: CategoryPerformanceProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Category performance</h2>
      </div>

      <div className={styles.categoryList}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.name} className={styles.categoryRow}>
              <div>
                <p className={styles.categoryName}>{category.name}</p>
              </div>
              <span className={styles.categoryCount}>
                {category._count.id} items
              </span>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>No categories yet.</p>
        )}
      </div>
    </section>
  );
};

export default CategoryPerformance;

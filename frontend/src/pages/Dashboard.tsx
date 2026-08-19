import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardStats from "../components/admin/DashboardStats";
import CategoryPerformance from "../components/admin/CategoryPerformance";
import AddListingForm from "../components/admin/AddListingForm";
import styles from "./Dashboard.module.css";

type DashboardOverview = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
};

type DashboardCategory = {
  name: string;
  _count: {
    id: number;
  };
};

type DashboardData = {
  overview: DashboardOverview;
  categories: DashboardCategory[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

const API_BASE_URL = import.meta.env.NEST_URL ?? "http://localhost:3000";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("tintin_token");

      const [dashboardResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/categories`, {
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      const dashboardResult = await dashboardResponse.json();
      const categoriesResult = await categoriesResponse.json();

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardResult.message ?? "Unable to load dashboard data.",
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesResult.message ?? "Unable to load categories.",
        );
      }

      setData(dashboardResult);
      setCategories(categoriesResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load dashboard data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "ADMIN") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admin overview</p>
            <h1>Dashboard</h1>
          </div>
          <Link to="/" className={styles.backLink}>
            Back to store
          </Link>
        </header>

        {error && (
          <div className={styles.alert}>
            <strong>Access issue:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading dashboard...</div>
        ) : data ? (
          <>
            <DashboardStats stats={data.overview} />
            <CategoryPerformance categories={data.categories} />
            <AddListingForm
              categories={categories}
              onCreated={fetchDashboard}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;

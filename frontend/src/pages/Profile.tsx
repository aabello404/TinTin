import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Profile.module.css";

const API_BASE_URL = import.meta.env.VITE_NEST_URL;

const Profile = () => {
    useEffect(() => {
      document.title = "Profile | TinTin";
    }, []);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    address: user?.address || "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role === "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [navigate, user]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("tintin_token");

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to update profile.");
      }

      setSuccess("Profile updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update profile.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === "ADMIN") {
    return null;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Account</p>
            <h1>My Profile</h1>
          </div>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </header>

        {error && (
          <div className={styles.alert}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && <div className={styles.success}>{success}</div>}

        <section className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h2>Account Information</h2>
          </div>

          <div className={styles.infoSection}>
            <label className={styles.infoField}>
              <span className={styles.label}>Email</span>
              <p className={styles.value}>{user.email}</p>
            </label>
          </div>

          <form className={styles.profileForm} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Address</span>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street address, city, etc."
                  rows={4}
                />
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;

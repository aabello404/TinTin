import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

const API_BASE_URL = import.meta.env.NEST_URL ?? "http://localhost:3000";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      setError("You need to be logged in before completing your profile.");
      return;
    }

    if (!address.trim()) {
      setError("Address is required to complete your profile.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("tintin_token");
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: user.name, address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not update your profile.");
      }

      login(
        {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          address: data.address,
          paymentMethods: data.paymentMethods ?? [],
        },
        localStorage.getItem("tintin_token") ?? "",
      );

      navigate("/", {
        replace: true,
        state: { signupSuccess: "Your account was created successfully." },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update profile.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to create account.");
      }

      login(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          address: data.user.address ?? null,
          paymentMethods: data.user.paymentMethods ?? [],
        },
        data.accessToken,
      );

      setSuccess("Your account was created successfully.");
      setShowProfileSetup(!data.user.address);
      if (!data.user.address) {
        setAddress("");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (location.state?.completeProfile === true || showProfileSetup) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <img
            src="/signUp.svg"
            alt="Complete Profile"
            className={styles.authImage}
          />
          <h2 className={styles.title}>Complete Your Profile</h2>

          <form className={styles.form} onSubmit={handleProfileUpdate}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="address">
                Delivery Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                required
                rows={4}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <div className={styles.toggleLink}>
            <Link to="/">Skip for now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <img src="/signUp.svg" alt="Sign Up" className={styles.authImage} />
        <h2 className={styles.title}>Create Account</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="address">
              Address (optional for now)
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Optional: add your delivery address"
              rows={3}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.toggleLink}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

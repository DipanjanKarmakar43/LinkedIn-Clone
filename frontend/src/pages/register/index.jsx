import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/AuthForm.module.css";
import UserLayout from "@/layout/UserLayout";
import { clientServer } from "@/config";
import LoadingScreen from "@/components/LoadingScreen";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await clientServer.post("/register", formData);

      // Store token and user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Wait exactly 5 seconds before redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1900);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <UserLayout>
      <div className={styles.registerContainer}>
        <h2 className={styles.registerTitle}>
          Make the most of your professional life
        </h2>
        <div className={styles.registerCard}>
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              type="text"
              required
            />
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              type="text"
              required
            />
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              type="email"
              required
            />
            <div className={styles.passwordWrapper}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className={styles.showToggle}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" defaultChecked /> Keep me logged in
            </label>

            <p className={styles.terms}>
              By clicking Agree & Join, you agree to the{" "}
              <a href="#">User Agreement</a>, <a href="#">Privacy Policy</a>,
              and <a href="#">Cookie Policy</a>.
            </p>

            <button type="submit" className={styles.submitButton}>
              Agree & Join
            </button>

            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>

          <div className={styles.divider}>
            <hr />
            <h1>or</h1>
            <hr />
          </div>

          <button
            className={styles.socialButton}
            type="button"
            onClick={() => console.log("Register with Google")}
          >
            <img src="/images/Google.png" alt="Google Logo" />
            Continue with Google
          </button>

          <p className={styles.formFooter}>
            Already on LinkedIn?{" "}
            <a onClick={() => router.push("/login")}>Sign in</a>
          </p>
        </div>
      </div>
    </UserLayout>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../../styles/AuthForm.module.css";

export default function Register() {
  const Router = require("next/router");
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", formData);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", storedTheme);
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.authTitle}>
        <a onClick={() => Router.push("/")}>
          <img src="/images/LinkedIn-Logo.png" alt="LinkedIn Logo" />
        </a>
        <button onClick={toggleTheme} id="theme-toggle">
          {" "}
          {theme === "light" ? (
            <span class="material-symbols-outlined">light_off</span>
          ) : (
            <span class="material-symbols-outlined">lightbulb</span>
          )}
        </button>
      </div>
      <h2 className={styles.registerTitle}>
        Make the most of your professional life
      </h2>
      <div className={styles.registerCard}>
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className={styles.input}
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className={styles.input}
          />
          <input
            name="email"
            placeholder="Email or phone number"
            onChange={handleChange}
            className={styles.input}
          />
          <div className={styles.passwordWrapper}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className={styles.input}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={styles.showToggle}
            >
              Show
            </span>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" defaultChecked /> Keep me logged in
          </label>

          <p className={styles.terms}>
            By clicking Agree & Join, you agree to the{" "}
            <a href="#">User Agreement</a>, <a href="#">Privacy Policy</a>, and{" "}
            <a href="#">Cookie Policy</a>.
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
        <button className={styles.socialButton}> <img src="/images/Google.png" alt="Google Logo" />Continue with Google</button>

        <p className={styles.formFooter}>
          Already on LinkedIn?{" "}
          <a
            onClick={() => {
              Router.push("/login");
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

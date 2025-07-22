import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../../styles/AuthForm.module.css";

export default function Login() {
  const Router = require("next/router");
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
    <div className={styles.loginContainer}>
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
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Sign in</h2>

        <button className={styles.socialButton}>
          <img src="/images/Google.png" alt="Google Logo" /> Continue with
          Google
        </button>
        <button className={styles.socialButton}>
          <img src="/images/Apple.png" alt="Apple Logo" /> Sign in with Apple
        </button>

        <div className={styles.divider}>
          <hr />
          <h1>or</h1>
          <hr />
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            name="emailOrUsername"
            placeholder="Email or phone"
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

          <div className={styles.loginOptions}>
            <a href="#">Forgot password?</a>
            <label className={styles.checkbox}>
              <input type="checkbox" defaultChecked /> Keep me logged in
            </label>
          </div>

          <button type="submit" className={styles.submitButton}>
            Sign in
          </button>

          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
      </div>
      <p className={styles.formFooter}>
        New to LinkedIn?{" "}
        <a onClick={() => Router.push("/register")}>Join now</a>
      </p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/AuthForm.module.css";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { clientServer } from "@/config";
import LoadingScreen from "@/components/LoadingScreen";

export default function Login() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await clientServer.post("/login", formData);

      // Store token and user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Show loader for exactly 5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800); // 1.8 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <UserLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Sign in</h2>

          <button
            className={styles.socialButton}
            type="button"
            onClick={() => console.log("Google login")}
          >
            <img src="/images/Google.png" alt="Google Logo" />
            Continue with Google
          </button>
          <button
            className={styles.socialButton}
            type="button"
            onClick={() => console.log("Apple login")}
          >
            <img src="/images/Apple.png" alt="Apple Logo" />
            Sign in with Apple
          </button>

          <div className={styles.divider}>
            <hr />
            <h1>or</h1>
            <hr />
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <input
              name="emailOrUsername"
              placeholder="Email or Username"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className={styles.input}
              type="text"
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
          <a onClick={() => router.push("/register")}>Join now</a>
        </p>
      </div>
    </UserLayout>
  );
}

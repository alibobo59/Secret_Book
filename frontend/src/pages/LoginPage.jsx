import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await authService.login({
        email: loginForm.email,
        password: loginForm.password,
        remember: loginForm.rememberMe,
      });

      // Redirect to account page after successful login
      navigate("/account");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-gray-100 py-4">
        <div className="mx-auto max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-amber-500">
                Home
              </Link>
              <span className="mx-2 text-gray-500">/</span>
            </li>
            <li className="text-amber-500">Login</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">Login</h1>

        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Login to Your Account</h2>

            {loginError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                role="alert">
                <p>{loginError}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="login-email"
                  className="mb-1 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="login-password"
                  className="mb-1 block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="rememberMe"
                    checked={loginForm.rememberMe}
                    onChange={handleLoginChange}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-amber-500 hover:text-amber-600">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded bg-amber-400 py-2 font-bold text-gray-900 transition hover:bg-yellow-300 flex justify-center items-center"
                disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-amber-500 hover:text-amber-600">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

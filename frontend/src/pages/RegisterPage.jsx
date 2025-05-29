import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Form errors and loading state
  const [registerErrors, setRegisterErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Handle register form input changes
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value,
    });
  };

  // Validate register form
  const validateRegisterForm = () => {
    const errors = {};

    // Name validation
    if (!registerForm.name.trim()) {
      errors.name = "Name is required";
    }

    // Email validation
    if (!registerForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      errors.email = "Email is invalid";
    }

    // Password validation
    if (!registerForm.password) {
      errors.password = "Password is required";
    } else if (registerForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  // Get register function from AuthContext
  const { register } = useAuth();

  // Handle register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setIsRegistering(true);
    setRegisterErrors({});

    try {
      // Prepare data for API
      const userData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.confirmPassword,
      };

      // Call register API
      await register(userData);

      // Show success message and reset form
      setRegisterSuccess(true);
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to account page after a short delay
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    } catch (error) {
      // Handle API errors
      console.error("Registration error:", error);

      if (error.errors) {
        // Map backend validation errors to form fields
        const apiErrors = {};
        for (const key in error.errors) {
          apiErrors[key] = error.errors[key][0];
        }
        setRegisterErrors(apiErrors);
      } else {
        // General error
        setRegisterErrors({
          general: error.message || "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsRegistering(false);
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
            <li className="text-amber-500">Register</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold">Create Account</h1>

        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Register</h2>
            {registerSuccess ? (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
                role="alert">
                <p className="font-bold">Registration Successful!</p>
                <p>
                  Your account has been created successfully. You can now access
                  your account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                {registerErrors.general && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                    role="alert">
                    <p>{registerErrors.general}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="register-name"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterInputChange}
                    required
                    className={`w-full rounded border px-4 py-2 focus:outline-none ${
                      registerErrors.name
                        ? "border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                  />
                  {registerErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="register-email"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterInputChange}
                    required
                    className={`w-full rounded border px-4 py-2 focus:outline-none ${
                      registerErrors.email
                        ? "border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                  />
                  {registerErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="register-password"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterInputChange}
                    required
                    className={`w-full rounded border px-4 py-2 focus:outline-none ${
                      registerErrors.password
                        ? "border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                  />
                  {registerErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterInputChange}
                    required
                    className={`w-full rounded border px-4 py-2 focus:outline-none ${
                      registerErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-amber-400 py-2 font-bold text-gray-900 transition hover:bg-yellow-300 flex justify-center items-center"
                  disabled={isRegistering}>
                  {isRegistering ? (
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
                      Processing...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-amber-500 hover:text-amber-600">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

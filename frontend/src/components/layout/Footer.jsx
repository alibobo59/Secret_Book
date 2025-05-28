import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="mb-4">
            <h3 className="mb-3 text-lg font-bold">About</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-us"
                  className="text-gray-600 hover:text-amber-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-600 hover:text-amber-500">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-lg font-bold">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Safety Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-lg font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Cookies Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-amber-500">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-lg font-bold">Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              <img
                src="./assets/images/payment-method-visa.svg"
                alt="Visa"
                className="h-8"
              />
              <img
                src="./assets/images/payment-method-mastercard.svg"
                alt="Mastercard"
                className="h-8"
              />
              <img
                src="./assets/images/payment-method-paypal.svg"
                alt="PayPal"
                className="h-8"
              />
              <img
                src="./assets/images/payment-method-stripe.svg"
                alt="Stripe"
                className="h-8"
              />
              <img
                src="./assets/images/payment-method-bitcoin.svg"
                alt="Bitcoin"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} MayBell - Online furniture store. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

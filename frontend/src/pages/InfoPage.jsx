import React from "react";
import { Link, useParams } from "react-router-dom";

const PAGE_CONTENT = {
  features: {
    title: "Features",
    description:
      "Explore all BudgetBuddy tools including smart analytics, receipt parsing, budget alerts, and shared expense tracking.",
  },
  pricing: {
    title: "Pricing",
    description:
      "BudgetBuddy offers a generous free plan for students and optional premium add-ons for advanced insights.",
  },
  integrations: {
    title: "Integrations",
    description:
      "Connect your workflow with exports, API support, and future banking integrations for easier tracking.",
  },
  "student-plan": {
    title: "Student Plan",
    description:
      "The Student Plan is designed for low-cost budgeting with essential features and semester-friendly limits.",
  },
  blog: {
    title: "Blog",
    description:
      "Read practical guides on budgeting, saving techniques, and financial planning for students.",
  },
  scholarships: {
    title: "Scholarships",
    description:
      "Find curated scholarship resources and planning tips to reduce education expenses.",
  },
  "help-center": {
    title: "Help Center",
    description:
      "Get setup help, troubleshooting steps, and frequently asked questions about BudgetBuddy.",
  },
  "api-docs": {
    title: "API Docs",
    description:
      "API documentation includes authentication details, endpoint references, and examples.",
  },
  "about-us": {
    title: "About Us",
    description:
      "BudgetBuddy is built to make personal finance simple, intuitive, and accessible for everyone.",
  },
  careers: {
    title: "Careers",
    description:
      "Join us to build delightful financial tools and help users improve money habits every day.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "Your privacy matters. BudgetBuddy does not sell personal data and follows secure data practices.",
  },
  contact: {
    title: "Contact",
    description:
      "Need support? Reach our team for account help, feedback, and product-related questions.",
  },
  "terms-of-service": {
    title: "Terms of Service",
    description:
      "Review service terms, account responsibilities, and fair use guidelines.",
  },
  "cookie-settings": {
    title: "Cookie Settings",
    description:
      "Manage cookie preferences and understand how cookies improve experience and analytics.",
  },
};

const InfoPage = () => {
  const { slug } = useParams();
  const page = PAGE_CONTENT[slug];

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Page Not Found</h1>
          <p className="mt-3 text-slate-600">
            The page you are looking for is not available.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              Back to Home
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          BudgetBuddy
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{page.title}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          {page.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
          >
            Back to Home
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;

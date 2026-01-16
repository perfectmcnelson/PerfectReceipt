import React from "react";
import { Mail, Ban } from "lucide-react";

const AccountSuspended = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <Ban className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Account Suspended
        </h1>

        <p className="text-gray-600 mb-6">
          Your account has been suspended due to a policy or billing issue.
          You’ve been logged out for security reasons.
        </p>

        <div className="bg-gray-100 rounded-md p-4 text-sm text-gray-700 mb-6">
          If you believe this is a mistake or need clarification, please contact
          our support team.
        </div>

        <a
          href="mailto:perfectmcnelson@gmail.com"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default AccountSuspended;

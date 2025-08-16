import React from "react";
import SignUpForm from "@/components/forms/SignUpForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full h-full flex">
      {/* Left side - Branding */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-green-500/20 via-blue-500/10 to-background">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
        <div className="relative flex flex-col justify-center items-center h-full px-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-6">ShelfSpot</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Start organizing your space
              <br />
              in minutes
            </p>
            <div className="space-y-4 max-w-md">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
                <div className="text-2xl">✨</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Forever</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">No hidden costs</div>
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
                <div className="text-2xl">⚡</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Setup</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ready in 2 minutes</div>
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
                <div className="text-2xl">🔒</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure & Private</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Your data stays yours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}

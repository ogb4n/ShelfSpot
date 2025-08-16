import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full h-full flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex flex-col justify-center items-center h-full px-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-6">ShelfSpot</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Organize your space,
              <br />
              find your things
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Organization</div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Search</div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Ready</div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Home & Office</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Button } from "@/components/ui/button";

import { AuthContext } from "@/app/context/AuthContext";
import { AuthContextType } from "@/typings";

import Signup from "./_component/signup";
import InputWithLabel from "./_component/InputWithLabel";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Login() {
  const router = useRouter();

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const { userLogin, currentUser }: any = useContext<AuthContextType | null>(
    AuthContext
  );

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    userLogin(inputs);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    document.title = "Makemates | Login";
    if (currentUser) {
      router.push("/feed");
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100/60 via-white to-blue-200/60 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
      <div className="w-full max-w-sm p-8 rounded-2xl shadow-2xl bg-white/60 dark:bg-neutral-900/60 mx-4 flex flex-col items-center backdrop-blur-xl border border-white/30 dark:border-white/10">
        <h1 className="text-3xl tracking-tight text-blue-600 dark:text-blue-400 mb-1">
          make<span className="font-extrabold">mates</span>
        </h1>
        <span className="text-xs text-gray-400 dark:text-gray-500 mb-6">
          Sign in to your account
        </span>
        <form
          onSubmit={handleSubmit}
          name="loginForm"
          className="flex flex-col gap-4 w-full"
        >
          <div className="border-b border-gray-300 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
            <InputWithLabel
              name="email"
              label="Email"
              placeholder="Email address"
              type="text"
              onChange={onInputChange}
            />
          </div>
          {/* Password Field with Eye Icon */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1"
            >
              Password
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={onInputChange}
                className="flex-1  bg-transparent border-none outline-none p-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant={"link"}
                tabIndex={-1}
                className="ml-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-500 dark:text-blue-400 hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <Button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg py-2 text-base transition-colors shadow-md"
          >
            Login
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {`Don't have an account? `}
          <Signup />
        </div>
      </div>
    </div>
  );
}

export default Login;

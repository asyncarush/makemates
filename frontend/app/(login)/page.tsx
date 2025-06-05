"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";

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
    <div>
      <div className="flex flex-col items-center h-screen justify-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl text-blue-500 tracking-wide transition-colors">
            make<span className="font-semibold text-blue-500">mates</span>
          </h1>
        </div>
        <h3 className="text-xl">Join us now</h3>
        <form
          onSubmit={handleSubmit}
          name="loginForm"
          className="flex flex-col gap-4 w-[300px]"
        >
          <InputWithLabel
            name="email"
            label="Email"
            placeholder="Enter your email address"
            type="text"
            onChange={onInputChange}
          />
          <InputWithLabel
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            onChange={onInputChange}
          />
          <Button type="submit" className="bg-green-500">
            Login
          </Button>
        </form>
        <p>
          {`Don't have account? `}
          <Signup />
        </p>
      </div>
    </div>
  );
}

export default Login;

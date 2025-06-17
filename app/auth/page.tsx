"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {myAPPHook} from "@/context/AppProvider";
// An interface in TypeScript is used to specify the structure of an
//  object—what properties it should have and their types.
interface formData {
  name?: string,
  email: string,
  password: string,
  password_confirmation?: string;
}
const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<formData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const router = useRouter();
const {login, register,authToken, isLoading} = myAPPHook();
  useEffect(() => {
    if (authToken) {
      router.push("/dashboard");
    }
  }, [authToken, isLoading]);
  //  that updates the formData state when an input field changes.
  const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handleFormSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
    if (isLogin) {
      try {
        await login(formData.email, formData.password);
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      try {
        await register(
          formData.name!,
          formData.email,
          formData.password,
          formData.password_confirmation!
        );
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };
  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4" style={{ width: "400px" }}>
          {/* <!-- Login Form --> */}
          <h3 className="text-center">{isLogin ? "Login" : "Register"}</h3>
          <form onSubmit={handleFormSubmit}>
            {!isLogin && (
              <input
                className="form-control mb-2"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleOnChangeInput}
                placeholder="Name"
                required
              />
            )}
            <input
              className="form-control mb-2"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleOnChangeInput}
              placeholder="Email"
              required
            />
            <input
              className="form-control mb-2"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleOnChangeInput}
              placeholder="Password"
              required
            />
            {!isLogin && (
              <input
                className="form-control mb-2"
                name="password_confirmation"
                type="password"
                // formData.password_confirmation is likely a property in your form's state object that holds the user's input for password confirmation
                value={formData.password_confirmation}
                onChange={handleOnChangeInput}
                placeholder="Confirm Password"
                required
              />
            )}
            <button className="btn btn-primary w-100" type="submit">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p
            className="mt-3 text-center"
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </>
  );
};
export default Auth;

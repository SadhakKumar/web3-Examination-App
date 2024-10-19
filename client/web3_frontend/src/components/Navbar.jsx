import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import logo from "./meta.png";

const Navbar = () => {
  return (
    <div className="navbar bg-customYellow2 shadow-md">
      <div className="navbar-start">
        <div className="flex items-center">
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            className="h-11 w-11 rounded-full mr-2" // Adjust size as needed
          />
          <a className="btn btn-ghost font-extrabold text-white text-2xl">Web3 Exam</a>
        </div>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="navbar-center hidden lg:flex"></div>
      <div className="navbar-end">
        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;

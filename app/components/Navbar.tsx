"use client";
import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      {/* Left Section */}
      <div className="navbar-start">
        {/* Mobile Dropdown */}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/studentsgala">Students Gala</Link>
            </li>
            <li>
              <details>
                <summary>Sahityotsav</summary>
                <ul className="p-2">
                  <li>
                    <Link href="https://ssfkozhikodesouth.in/">Results</Link>
                  </li>
                  <li>
                    <Link href="https://ssfkozhikodesouth.in/gallerypage">
                      Gallery
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <Link href="/smile">Smile</Link>
            </li>
          </ul>
        </div>

        {/* Logo + Title */}
        <Link href="/" className="flex items-center w-[90%] gap-2 pl-2">
          <img src="/logo.png" width={30} height={30} alt="SSF Logo" />
          <span className="font-semibold text-lg md:text-xl hidden md:block ">
            SSF Kozhikode South
          </span>
        </Link>
      </div>

      {/* Center Menu (Desktop) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/studentsgala">Students Gala</Link>
          </li>
          <li>
            <details>
              <summary>Sahityotsav</summary>
              <ul className="p-2">
                <li>
                  <Link href="https://ssfkozhikodesouth.in/">Results</Link>
                </li>
                <li>
                  <Link href="https://ssfkozhikodesouth.in/gallerypage">
                    Gallery
                  </Link>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Link href="/smile">Smile</Link>
          </li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="navbar-end">
        <Link href="/login" className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

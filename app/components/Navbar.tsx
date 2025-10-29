"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Sticky Navbar
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navbarOpen]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Students Gala", href: "/studentsgala" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        sticky ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pl-2">
          <img src="/logo.png" width={30} height={30} alt="SSF Logo" />
          <h2 className="hidden lg:flex text-2xl font-medium text-black">
            SSF Kozhikode South
          </h2>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 me-5 font-medium text-black">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition ${
                pathname === item.href
                  ? "text-green-700 font-semibold border-b-2 border-green-700 pb-1"
                  : "hover:text-green-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button className="hidden lg:block bg-green-700 text-white px-6 py-2 rounded-xl hover:bg-green-800 transition">
            Login
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="block lg:hidden text-black p-2 rounded-lg focus:outline-none"
            aria-label="Toggle Menu"
          >
            <Icon icon={navbarOpen ? "tabler:x" : "tabler:menu-2"} width={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        } z-50 border-l border-gray-200`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">SSF Kozhikode South</h2>
          <button
            onClick={() => setNavbarOpen(false)}
            className="text-black"
            aria-label="Close Menu"
          >
            <Icon icon="tabler:x" width={24} />
          </button>
        </div>

        <nav className="flex flex-col items-start p-4 space-y-4 text-black text-lg">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setNavbarOpen(false)}
              className={`w-full transition ${
                pathname === item.href
                  ? "text-green-700 font-semibold border-l-4 border-green-700 pl-3"
                  : "hover:text-green-700"
              }`}
            >
              {item.name}
            </Link>
          ))}

          <button
            onClick={() => alert("Button Clicked!")}
            className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition"
          >
            Join Now
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {navbarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setNavbarOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Navbar;


// "use client";
// import React from "react";
// import Link from "next/link";

// const Navbar = () => {
//   return (
//     <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
//       {/* Left Section */}
//       <div className="navbar-start">
//         {/* Mobile Dropdown */}
//         <div className="dropdown">
//           <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6h16M4 12h16M4 18h16"
//               />
//             </svg>
//           </div>

//           <ul
//             tabIndex={0}
//             className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
//           >
//             <li>
//               <Link href="/studentsgala">Students Gala</Link>
//             </li>
//             <li>
//               <details>
//                 <summary>Sahityotsav</summary>
//                 <ul className="p-2">
//                   <li>
//                     <Link href="https://ssfkozhikodesouth.in/">Results</Link>
//                   </li>
//                   <li>
//                     <Link href="https://ssfkozhikodesouth.in/gallerypage">
//                       Gallery
//                     </Link>
//                   </li>
//                 </ul>
//               </details>
//             </li>
//             <li>
//               <Link href="/smile">Smile</Link>
//             </li>
//           </ul>
//         </div>

//         {/* Logo + Title */}
//         <Link href="/" className="flex items-center w-[90%] gap-2 pl-2">
//           <img src="/logo.png" width={30} height={30} alt="SSF Logo" />
//           <span className="font-semibold text-lg md:text-xl hidden md:block ">
//             SSF Kozhikode South
//           </span>
//         </Link>
//       </div>

//       {/* Center Menu (Desktop) */}
//       <div className="navbar-center hidden lg:flex">
//         <ul className="menu menu-horizontal px-1">
//           <li>
//             <Link href="/studentsgala">Students Gala</Link>
//           </li>
//           <li>
//             <details>
//               <summary>Sahityotsav</summary>
//               <ul className="p-2">
//                 <li>
//                   <Link href="https://ssfkozhikodesouth.in/">Results</Link>
//                 </li>
//                 <li>
//                   <Link href="https://ssfkozhikodesouth.in/gallerypage">
//                     Gallery
//                   </Link>
//                 </li>
//               </ul>
//             </details>
//           </li>
//           <li>
//             <Link href="/smile">Smile</Link>
//           </li>
//         </ul>
//       </div>

//       {/* Right Section */}
//       <div className="navbar-end">
//         <Link href="/login" className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
//           Login
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

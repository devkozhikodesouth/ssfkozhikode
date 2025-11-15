import { div } from "framer-motion/client";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <nav className="relative">
  <div className="fab fab-flower">
    <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-primary">
      +
    </div>

    {/* Main Action button */}
    <button className="fab-main-action btn btn-circle btn-lg bg-blue-600 text-white">
      S
    </button>

    {/* Social Buttons */}
    <Link href="https://www.instagram.com/ssfkozhikodesouth">
      <button className="btn btn-lg btn-circle bg-pink-500 text-white border-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zm4.5 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
        </svg>
      </button>
    </Link>

    <Link href="https://youtube.com/@ssfkozhikodesouth">
      <button className="btn btn-lg btn-circle bg-red-600 text-white border-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      </button>
    </Link>

    <Link href="https://www.facebook.com/SSFKozhikodeSouth">
      <button className="btn btn-lg btn-circle bg-blue-800 text-white border-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      </button>
    </Link>
  </div>
</nav>

  );
};

export default Footer;

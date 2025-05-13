"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-[1000] py-4 transition-all">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Opportunity Cost Logo"
            width={40}
            height={40}
            className="h-10 w-10 mr-3"
          />
          <h1 className="text-xl font-bold mb-0">Opportunity Cost</h1>
        </div>
        <nav className="hidden sm:block">
          <ul className="flex">
            <li className="ml-8">
              <a
                href="#features"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                Features
              </a>
            </li>
            <li className="ml-8">
              <a
                href="#download"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                Download
              </a>
            </li>
            <li className="ml-8">
              <a
                href="#about"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                About
              </a>
            </li>
            <li className="ml-8">
              <a
                href="#faq"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

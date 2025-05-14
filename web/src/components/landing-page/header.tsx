"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-[1000] py-4 transition-all">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/svg/icon.svg"
            alt="Opportunity Cost Logo"
            width={32}
            height={32}
            className="size-12 mr-3"
          />
          <h1 className="text-xl font-bold tracking-tight mb-0">
            Opportunity Cost
          </h1>
        </Link>
        <nav className="hidden sm:block">
          <ul className="flex">
            <li className="ml-8">
              <Link
                href="/#features"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                Features
              </Link>
            </li>
            <li className="ml-8">
              <Link
                href="/#download"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                Download
              </Link>
            </li>
            <li className="ml-8">
              <Link
                href="/#about"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                About
              </Link>
            </li>
            <li className="ml-8">
              <Link
                href="/#faq"
                className="text-gray-900 font-medium hover:text-orange-500 transition"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

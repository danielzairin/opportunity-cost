"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#download", label: "Download" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] py-4">
      <Container>
        <div
          className={`flex justify-between items-center w-full bg-background/95 backdrop-blur-lg border rounded-full px-6 py-3 transition-all duration-300 ${
            isScrolled ? "shadow-lg border-gray-200" : "shadow border-gray-100"
          }`}
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/svg/icon.svg"
              alt="Opportunity Cost Logo"
              width={24}
              height={24}
              className="size-10 mr-2"
            />
            <h1 className="text-xl font-bold tracking-tight mb-0">
              Opportunity Cost
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:block">
            <ul className="flex items-center">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-900 text-sm font-medium hover:text-[var(--primary)] hover:bg-neutral-100 transition px-4 py-3 rounded-lg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="sm:hidden p-2 rounded-lg hover:bg-neutral-100 transition"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-2">
            <div className="bg-background/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <nav>
                <ul className="py-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block text-gray-900 text-sm font-medium hover:text-[var(--primary)] hover:bg-neutral-100 transition px-6 py-3"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

"use client";
import Image from "next/image";
import { Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-5">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="flex flex-col items-start">
            <Image
              src="/images/logo-small.svg"
              alt="Opportunity Cost Logo"
              width={32}
              height={32}
              className="h-10 mb-4"
            />
            <p className="text-lg font-bold">Opportunity Cost</p>
          </div>
          <div>
            <h3 className="text-white mb-4 text-base font-semibold">Links</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition"
                >
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#download"
                  className="text-gray-300 hover:text-white transition"
                >
                  Download
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition"
                >
                  About
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#faq"
                  className="text-gray-300 hover:text-white transition"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4 text-base font-semibold">Legal</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="/privacy-policy.html"
                  className="text-gray-300 hover:text-white transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/terms.html"
                  className="text-gray-300 hover:text-white transition"
                >
                  Terms of Use
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4 text-base font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/tfcbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://github.com/tftc/opportunity-cost"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Github size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-5 text-center">
          <p className="text-gray-400 text-sm mb-0">
            &copy; 2025 Opportunity Cost | Powered by{" "}
            <a
              href="https://tftc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:underline"
            >
              Truth For The Commoner (TFTC)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

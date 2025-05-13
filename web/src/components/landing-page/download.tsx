"use client";
import { Chrome, FlameKindling } from "lucide-react";

export function Download() {
  return (
    <section id="download" className="text-center py-20">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <h2 className="text-3xl font-bold mb-6">Download the Extension</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Opportunity Cost is available for Chrome and Firefox browsers. Install
          it today to start seeing prices in Bitcoin!
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-16">
          <div
            id="chrome"
            className="bg-gray-50 rounded-lg p-10 w-full md:w-[300px] text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg browser-card flex flex-col items-center"
          >
            <Chrome size={48} className="text-gray-700 h-20 mb-5" />
            <h3 className="text-xl font-bold mb-2">Chrome Extension</h3>
            <p className="mb-6 text-gray-600">Version 1.0.0</p>
            <a
              href="https://chrome.google.com/webstore/detail/opportunity-cost/"
              className="inline-block px-6 py-3 font-semibold rounded-lg bg-orange-500 text-white border-2 border-orange-500 hover:bg-orange-600 transition"
            >
              Add to Chrome
            </a>
          </div>
          <div
            id="firefox"
            className="bg-gray-50 rounded-lg p-10 w-full md:w-[300px] text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg browser-card flex flex-col items-center"
          >
            <FlameKindling size={48} className="text-gray-700 h-20 mb-5" />
            <h3 className="text-xl font-bold mb-2">Firefox Add-on</h3>
            <p className="mb-6 text-gray-600">Version 1.0.0</p>
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/opportunity-cost/"
              className="inline-block px-6 py-3 font-semibold rounded-lg bg-orange-500 text-white border-2 border-orange-500 hover:bg-orange-600 transition"
            >
              Add to Firefox
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

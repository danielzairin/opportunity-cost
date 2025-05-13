"use client";
import {
  Bitcoin,
  Columns,
  Shield,
  BarChart2,
  Settings,
  RefreshCcw,
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <Bitcoin size={48} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Real-time Price Conversion
            </h3>
            <p className="text-gray-600">
              Automatically convert USD, EUR, and GBP prices to Bitcoin or
              satoshis as you browse.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <Columns className="text-orange-500 size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Dual Display Mode</h3>
            <p className="text-gray-600">
              View prices in both Bitcoin and fiat currency side by side for
              better comparison.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <Shield className="text-orange-500 size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy Focused</h3>
            <p className="text-gray-600">
              Works entirely on your device with no data sent to external
              servers. Your browsing stays private.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <BarChart2 className="text-orange-500 size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conversion Statistics</h3>
            <p className="text-gray-600">
              Track your browsing patterns and see which sites have the most
              Bitcoin price conversions.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <Settings className="text-orange-500 size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Customizable Preferences</h3>
            <p className="text-gray-600">
              Choose between satoshis or BTC denomination and customize your
              display preferences.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg feature-card">
            <div className="w-15 h-15 mb-5 flex items-center justify-center bg-orange-100 rounded-full">
              <RefreshCcw className="text-orange-500 size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auto-refreshing Prices</h3>
            <p className="text-gray-600">
              Bitcoin price data automatically refreshes to ensure you always
              see accurate conversions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

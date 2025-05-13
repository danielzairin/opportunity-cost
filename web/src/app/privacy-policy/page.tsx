import React from "react";
import { Header } from "@/components/landing-page/header";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mt-20 mx-auto px-4 py-16 text-gray-900 bg-white">
        <h1 className="text-3xl font-bold mb-2">
          Privacy Policy for Opportunity Cost Browser Extension
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last Updated: April 30, 2025
        </p>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Introduction</h2>
          <p>
            Welcome to the Opportunity Cost Browser Extension {`("Extension")`}.
            This Privacy Policy explains what information we collect, how we use
            it, and what rights you have in relation to your information when
            you use our Extension.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
          <h3 className="font-semibold mt-4 mb-1">
            User Settings and Preferences
          </h3>
          <ul className="list-disc ml-6 mb-2">
            <li>Default currency settings</li>
            <li>Display mode preferences (dual-display or satoshis only)</li>
            <li>Auto-refresh settings</li>
            <li>Statistics tracking preferences</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">Usage Statistics</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>
              Websites where price conversions occur (domain names only, not
              complete URLs)
            </li>
            <li>Number of price conversions performed</li>
            <li>Timestamps of when conversions were performed</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">Bitcoin Price Data</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>Retrieves current Bitcoin price data from the CoinGecko API</li>
            <li>Stores historical Bitcoin price data locally on your device</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
          <h3 className="font-semibold mt-4 mb-1">Core Functionality</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>
              Convert fiat currency prices to Bitcoin satoshis on webpages you
              visit
            </li>
            <li>Display price information according to your preferences</li>
            <li>Cache Bitcoin price data to minimize API calls</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">
            Statistical and Analytical Purposes
          </h3>
          <ul className="list-disc ml-6 mb-2">
            <li>
              Track and display conversion statistics in the Extension's options
              page
            </li>
            <li>
              Display historical Bitcoin price data in the Extension's options
              page
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Data Storage and Sharing
          </h2>
          <h3 className="font-semibold mt-4 mb-1">Local Storage</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>Chrome Storage API (for Chrome)</li>
            <li>Firefox Storage API (for Firefox)</li>
            <li>IndexedDB (for larger datasets like price history)</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">Third-Party Services</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>
              The Extension connects to the CoinGecko API to retrieve Bitcoin
              price data
            </li>
            <li>
              No personal information is shared with CoinGecko or any other
              third parties
            </li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">External Links</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>
              When clicking the Extension icon, you will be directed to the
              Opportunity Cost app website
            </li>
            <li>
              This website has its own privacy policy that governs your use of
              that service
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Your Rights and Choices
          </h2>
          <h3 className="font-semibold mt-4 mb-1">Managing Your Information</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>View all stored data in the Extension's options page</li>
            <li>
              Clear all stored data using the "Clear All Data" button in the
              options page
            </li>
            <li>Disable statistics tracking in the Extension settings</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-1">Uninstallation</h3>
          <p>
            If you uninstall the Extension, all locally stored data will be
            permanently removed from your device.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p>
            We implement reasonable security measures to protect your
            information. However, no method of transmission over the Internet or
            electronic storage is 100% secure, so we cannot guarantee absolute
            security.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on the
            Extension's repository and updating the "Last Updated" date.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <ul className="list-disc ml-6 mb-2">
            <li>Email: contact@opportunitycost.app</li>
            <li>Website: https://opportunitycost.app</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Consent</h2>
          <p>
            By using our Extension, you consent to our Privacy Policy and agree
            to its terms.
          </p>
        </section>
      </main>
    </>
  );
}

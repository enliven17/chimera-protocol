"use client";

import { PYUSDBridge } from "@/components/bridge/pyusd-bridge";
import { ArrowLeftRight } from "lucide-react";

export default function BridgePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            background: linear-gradient(to bottom right, #0A0C14, #1A1F2C, #151923) !important;
            background-attachment: fixed !important;
          }
          .bridge-page {
            background: linear-gradient(to bottom right, #0A0C14, #1A1F2C, #151923) !important;
            background-attachment: fixed !important;
          }
        `
      }} />
      <div className="bridge-page min-h-screen text-white">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <ArrowLeftRight className="h-6 w-6 text-[#FFE100]" />
            <h1 className="text-2xl font-bold">PYUSD Bridge</h1>
          </div>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Bridge PYUSD from Ethereum Sepolia to Hedera Testnet
          </p>
        </div>

        {/* Bridge Component */}
        <div className="flex justify-center">
          <PYUSDBridge />
        </div>
      </div>
      </div>
    </>
  );
}
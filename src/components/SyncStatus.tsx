import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function SyncStatus() {
  const [syncAddress, setSyncAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAddress = async () => {
      try {
        const address = await invoke<string>("get_sync_address");
        setSyncAddress(address);
      } catch (e) {
        console.error("Failed to get sync address:", e);
      }
    };
    loadAddress();
  }, []);

  const copyAddress = async () => {
    if (syncAddress) {
      await navigator.clipboard.writeText(syncAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="px-6 py-4 border-t border-gray-100 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] text-gray-400 font-medium">Sync Server Active</span>
      </div>
      <button
        onClick={copyAddress}
        className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-blue-500 transition-colors"
      >
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[10px]">{syncAddress || "Loading..."}</span>
        {copied ? (
          <span className="text-green-500">Copied!</span>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </button>
      <p className="text-[10px] text-gray-300">Open LexiQ app on iPhone and enter this address in Settings</p>
    </div>
  );
}
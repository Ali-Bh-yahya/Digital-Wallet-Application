// src/hooks/useWallet.js
import { useEffect, useState } from "react";

export default function useWallet() {
  const [wallet, setWallet] = useState({ loading: true, data: null, err: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/wallet/info", { credentials: "include" });
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const json = await res.json();
        if (mounted) setWallet({ loading: false, data: json, err: null });
      } catch (err) {
        if (mounted) setWallet({ loading: false, data: null, err });
      }
    })();
    return () => { mounted = false; };
  }, []);

  return wallet;
}

"use client";

import { useState, useEffect } from "react";

export default function AdminTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("[AdminTest] Component mounted");
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ color: "green" }}>✅ Admin Test Page WORKING</h1>
      <p>Mounted: {mounted ? "YES" : "NO"}</p>
      <p>Timestamp: {new Date().toLocaleTimeString()}</p>
      <button onClick={() => alert("Button works!")}>Test Button</button>
      <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
        <h3>This is a minimal page to test rendering.</h3>
        <p>If you can see this, Next.js is working fine.</p>
        <p>The issue is likely in the main dashboard component.</p>
      </div>
    </div>
  );
}

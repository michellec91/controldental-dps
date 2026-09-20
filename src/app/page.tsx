"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  }, []);

  return null;
}
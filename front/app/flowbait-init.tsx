"use client";

import { useEffect } from "react";

export default function FlowbiteInit() {
  useEffect(() => {
    import("flowbite");
  }, []);

  return null;
}

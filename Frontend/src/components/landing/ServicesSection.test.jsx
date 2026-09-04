import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("../../hooks/useServicesCatalog", () => ({
  useServicesCatalog: () => ({ data: null, loading: false }),
}));

import ServicesSection from "./ServicesSection";

describe("ServicesSection", () => {
  it("does not crash when the catalog request fails or is unavailable", () => {
    expect(() => renderToString(<ServicesSection />)).not.toThrow();
  });
});

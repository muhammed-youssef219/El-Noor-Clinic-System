// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAsync } from "./useAsync";

describe("useAsync", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it("re-fetches on a configured polling interval", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(["first"])
      .mockResolvedValueOnce(["second"]);

    let latest;
    function Harness() {
      latest = useAsync(fetcher, [], { intervalMs: 1000 });
      return null;
    }

    await act(async () => {
      root.render(<Harness />);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1001);
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(latest.data).toEqual(["second"]);
  });
});

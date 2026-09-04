import { useEffect, useState } from "react";

// Set `target` to whatever should be printed (an invoice, a record...); once
// the print-sheet using it has actually committed to the DOM, this fires
// window.print(). Pair with a component rendering a `.print-sheet` for `target`.
export function usePrint() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!target) return;
    const timer = setTimeout(() => window.print(), 50);
    return () => clearTimeout(timer);
  }, [target]);

  return [target, setTarget];
}

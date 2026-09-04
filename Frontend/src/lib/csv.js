function escapeCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const UTF8_BOM = String.fromCharCode(0xfeff);

// Downloads a UTF-8 CSV (with BOM so Excel renders Arabic correctly instead
// of mojibake) built from a header row + array of row arrays.
export function exportToCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map(row => row.map(escapeCell).join(","));
  const csv = UTF8_BOM + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

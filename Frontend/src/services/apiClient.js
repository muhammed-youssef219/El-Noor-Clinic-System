const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const API_ORIGIN = API_URL.replace(/\/api\/v1$/, "");

export class ApiError extends Error {
  constructor(message, status, errors = {}) { super(message); this.status = status; this.errors = errors; }
}

function csrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrf() {
  if (typeof window === "undefined" || csrfToken()) return;
  await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, { credentials: "include" });
}

async function request(method, path, { body, multipart = false, csrf = method !== "GET" } = {}) {
  try {
    if (csrf) await ensureCsrf();
    const headers = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" };
    const token = typeof window === "undefined" ? null : csrfToken();
    if (token) headers["X-XSRF-TOKEN"] = token;
    if (body && !multipart) headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_URL}${path}`, { method, credentials: "include", headers, body: body ? (multipart ? body : JSON.stringify(body)) : undefined });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) throw new ApiError(payload?.message || "حدث خطأ أثناء الاتصال بالخادم", response.status, payload?.errors || {});
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى.", 0);
  }
}

export const apiClient = {
  get: path => request("GET", path, { csrf: false }),
  post: (path, body) => request("POST", path, { body }),
  patch: (path, body) => request("PATCH", path, { body }),
  put: (path, body) => request("PUT", path, { body }),
  delete: path => request("DELETE", path),
  upload: (path, body) => request("POST", path, { body, multipart: true }),
};

import { apiClient } from "./apiClient";
const query = filters => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== "all")); return params.toString() ? `?${params}` : ""; };
export const listInvoices = (filters = {}) => apiClient.get(`/invoices${query(filters)}`);
export const createInvoice = data => apiClient.post("/invoices", data);
export const markInvoicePaid = id => apiClient.patch(`/invoices/${id}/mark-paid`, {});
export async function submitPaymentProof(id, proof) { const body = new FormData(); body.append("proof", proof); return apiClient.upload(`/invoices/${id}/payment-proof`, body); }
export const confirmPaymentProof = id => apiClient.post(`/invoices/${id}/payment-proof/confirm`, {});
export const rejectPaymentProof = (id, reason) => apiClient.post(`/invoices/${id}/payment-proof/reject`, { reason });

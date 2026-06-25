import type { Employee } from "../types";

export function getFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateHours(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs > 0 ? Number((diffMs / 1000 / 60 / 60).toFixed(2)) : 0;
}

export function money(value?: number | string | null) {
  return `$${Number(value || 0).toFixed(2)}`;
}



// export function getFullName(employee: { firstName: string; lastName: string }) {
//   return `${employee.firstName} ${employee.lastName}`.trim();
// }

// export function formatDate(value?: string | null) {
//   if (!value) return "—";
//   return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//   });
// }

// export function calculateHours(start?: string | null, end?: string | null) {
//   if (!start || !end) return 0;
//   const diffMs = new Date(end).getTime() - new Date(start).getTime();
//   return diffMs > 0 ? Number((diffMs / 1000 / 60 / 60).toFixed(2)) : 0;
// }

// export function money(value?: number | string | null) {
//   return `$${Number(value || 0).toFixed(2)}`;
// }

// export function formatDateTime(value: string | null | undefined) {
//   if (!value) return "—";
//   return new Date(value).toLocaleString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// export function formatTime(value: string | null | undefined) {
//   if (!value) return "—";
//   return new Date(value).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }
export const getResolvedTimezone = () => {
  if (typeof Intl === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const formatTimePtBr = (date: Date) =>
  date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const formatDateTimePtBr = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
};

export const formatSavedAtLabel = (value?: string | null) => {
  if (!value) return "";
  const formatted = formatDateTimePtBr(value);
  return formatted ? `salvo em ${formatted}` : "";
};

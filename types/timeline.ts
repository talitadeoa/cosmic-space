export type TimelinePeriod = "30d" | "90d" | "1y";

export type TimelineItemType = "mensal" | "trimestral" | "anual" | "energia";

export type TimelineItem = {
  id: string;
  type: TimelineItemType;
  recordedAt: string;
  moonPhase: string | null;
  period: string | null;
  insight: string | null;
  energyLevel: number | null;
  phaseDate: string | null;
};

export type TimelineRange = {
  start: string;
  end: string;
};

export type TimelineResponse = {
  items: TimelineItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  range: TimelineRange;
};

export type TimelineFiltersState = {
  period: TimelinePeriod;
  types: TimelineItemType[];
  moonPhase: string | null;
};

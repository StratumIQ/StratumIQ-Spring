import { dashApi } from "./client";

type TrackActivityPayload = {
  action: "CONFIGURATOR_OPENED" | "REPORT_DOWNLOADED";
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
};

export const activityApi = {
  track: (payload: TrackActivityPayload) =>
    dashApi<{ message: string }>("/activity/track", {
      method: "POST",
      body: payload,
    }),
};

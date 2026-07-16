import {
  activeVisitors,
  branchStats,
  kpis,
  moduleRows,
  recentActivities,
  visitorTrend,
} from "../data/mockData";

const delay = (payload, duration = 450) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(payload), duration);
  });

export const visitorService = {
  getDashboard: () =>
    delay({
      kpis,
      visitorTrend,
      branchStats,
      activeVisitors,
      recentActivities,
    }),
  getModuleRows: () => delay(moduleRows),
};

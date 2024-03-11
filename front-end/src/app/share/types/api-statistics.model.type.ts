export type ApiStatistics = {
  apiKeys: {
    name: string;
    type: string;
    wosUsage: {
      wosQuota: number;
      used: number
      usedPercentage: number;
      available: number;
      availablePercentage: number;
    },
    apiUsage: number;
  }[],
  activeApiKeys: number;
  activeApiKeysPercentage: number;
  chartsData: {
    wosUsageOverTime: [];
    apiUsageOverTime: [];
    categories: string[];
  },
  wosQuota: number;
  wosRequests: number;
  wosUsedPercentage: number;
  wosAvailable: number;
  wosAvailablePercentage: number;
  apiRequests: number;
  dois: number;
  year: number;
};

export type ApiStatisticsSummary = {
  id: number;
  name: string;
  type: string;
  wos_quota: number;
  used_wos_quota: number;
  api_requests: number;
  is_active: number;
}

export type ApiUsage = {
  id: number;
  creation_date: string;
  path: string;
}

export type WosApiUsage = {
  id: number;
  creation_date: string;
  doi: string;
}

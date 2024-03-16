export type ApiStatistics = {
  apiKeys: number;
  activeApiKeys: number;
  activeApiKeysPercentage: number;
  chartsData: {
    wosUsageOverTime: [];
    apiUsageOverTime: [];
    categories: string[];
  },
  remainingWosQuota: number;
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
  quota: number;
  api_keys: number;
  used_wos_quota: number;
  api_requests: number;
  is_active: number;
}

export type ApiUsage = {
  api_key: string;
  name: string;
  type: string;
  id: number;
  creation_date: string;
  path: string;
}

export type WosApiUsage = {
  api_key: string;
  name: string;
  type: string;
  id: number;
  creation_date: string;
  doi: string;
}

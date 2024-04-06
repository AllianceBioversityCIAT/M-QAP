export type Statistics = {
  totalCommodities: number;
  totalOrganization: number;
  totalTrainingCycle: number;
  totalPrediction: number;
  totalTrainingData: number;
  predictionCountPerCycle: {
    cycle_id: number;
    cycle: string;
    predictions_count: number;
  }[];
  averagePredictionPerCycle: {
    cycle_id: number;
    cycle: string;
    predictions_average: number;
  }[];
};

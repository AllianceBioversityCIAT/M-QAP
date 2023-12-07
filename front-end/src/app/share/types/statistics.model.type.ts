export type Statistics = {
  totalCommodities: number;
  totalOrganization: number;
  totalTrainingCycle: number;
  totalPrediction: number;
  totalTrainingData: number;
  predictionCountPerCycle: {
    cycle_id: number;
    predictions_count: number;
  }[];
  averagePredictionPerCycle: {
    predictions_average: number;
    cycle_id: number;
  }[];
};

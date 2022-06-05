export const SCROLL_THRESHOLD = 300;
export const INTERVAL_OPT = {
  startingInt: 1500,
  maxInt: 2000,
  minInt: 100,
};

export interface DataModel {
  dataId: number;
  startTimeMs: number;
  stopTimeMs: number;
  startFrequencyHz: number;
  stopFrequencyHz: number;
  samplingFrequencyHz: number;
  confidence: BigInt;
  enterCase: string;
  isCritical: boolean;
  expectedTime: number;
  calculatedOffset: number;
}

export class TableDataModel {
  constructor(public data: DataModel, public checked: boolean) {}
}

export enum IS_CRITICAL {
  YES = 'Yes',
  NO = 'No',
  ALL = 'All',
}

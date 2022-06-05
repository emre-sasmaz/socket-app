import { DataModel } from './stream.models';

export type sortState = 'ascending' | 'descending';
export type colSortOption = { col: keyof DataModel; sort: sortState };
export type colFilterOption = { col: keyof DataModel; filter: string };

type tableOptions = {
  hasSort: boolean;
  hasFilter: boolean;
};

export interface TableColModel<T> {
  fieldName: keyof T;
  header: string;
  options?: tableOptions;
  style?: any;
}

export interface TableColSortModel<T> extends TableColModel<T> {}

export const STREAM_TABLE_COL: TableColModel<DataModel>[] = [
  {
    fieldName: 'dataId',
    header: 'ID',
  },
  {
    fieldName: 'startTimeMs',
    header: 'Start Time',
    options: { hasSort: true, hasFilter: false },
  },
  {
    fieldName: 'stopTimeMs',
    header: 'Stop Time',
  },
  { fieldName: 'startFrequencyHz', header: 'Start Frequency (Hz)' },
  { fieldName: 'stopFrequencyHz', header: 'Stop Frequency (Hz)' },
  { fieldName: 'samplingFrequencyHz', header: 'Sampling Frequency (Hz)' },
  {
    fieldName: 'confidence',
    header: 'Confidence',
  },
  { fieldName: 'enterCase', header: 'Enter Case' },
  { fieldName: 'isCritical', header: 'Is Critical ?' },
  { fieldName: 'expectedTime', header: 'Expected Time' },
  {
    fieldName: 'calculatedOffset',
    header: 'Calculated Offset',
  },
];

import { Between, In } from 'typeorm';

export const processRangeFilter = (key: string, value: object, target: object) => {
  const [start, end] = [value?.['start'], value?.['end']];
  if (start && end) target[key] = Between(start, end);
  else if (start == '0' && end) target[key] = Between(start, end);
};

export const processArrayOrValueFilter = (key: string, value: any, target: object) => {
  target[key] = Array.isArray(value) ? (value?.length ? In(value) : undefined) : value;
};

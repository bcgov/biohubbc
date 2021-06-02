// File header validation helper functions

import { IHeaderErrors } from './csv-validator';

export const getHeaderRow = (data: string[][]): string[] => {
  if (!data?.length) {
    return [];
  }

  return data[0];
};

export const getDuplicateHeaders = (headers: string[]): IHeaderErrors[] => {
  if (!headers?.length) {
    return [];
  }

  const seenHeaders: string[] = [];

  const headerErrors: IHeaderErrors[] = [];

  for (const header of headers) {
    if (seenHeaders.includes(header)) {
      headerErrors.push({
        type: 'Invalid',
        code: 'DuplicateHeader',
        message: 'Duplicate header',
        col: header
      });
    } else {
      seenHeaders.push(header);
    }
  }

  return headerErrors;
};

export const hasRequiredHeaders = (headers: string[], requiredHeaders?: string[]): IHeaderErrors[] => {
  if (!requiredHeaders?.length) {
    return [];
  }

  if (!headers?.length) {
    return requiredHeaders.map((requiredHeader) => {
      return {
        type: 'Missing',
        code: 'MissingRequiredHeader',
        message: 'Missing required header',
        col: requiredHeader
      };
    });
  }

  const headerErrors: IHeaderErrors[] = [];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      headerErrors.push({
        type: 'Missing',
        code: 'MissingRequiredHeader',
        message: 'Missing required header',
        col: requiredHeader
      });
    }
  }

  return headerErrors;
};

export const hasValidHeaders = (headers: string[], validHeaders?: string[]): IHeaderErrors[] => {
  if (!validHeaders?.length) {
    return [];
  }

  const headerErrors: IHeaderErrors[] = [];

  for (const header of headers) {
    if (!validHeaders.includes(header)) {
      headerErrors.push({
        type: 'Invalid',
        code: 'UnknownHeader',
        message: 'Unsupported header',
        col: header
      });
    }
  }

  return headerErrors;
};

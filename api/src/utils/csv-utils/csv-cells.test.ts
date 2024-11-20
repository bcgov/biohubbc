import { z } from 'zod';
import { validateZodCell } from './csv-cells';

describe('validateZodCell', () => {
  it.only('should return an empty array if the cell is valid', () => {
    const result = validateZodCell(
      { cell: 123, rowIndex: 0, header: 'header', row: {}, worksheet: {} },
      z.number().min(0).max(0)
    );
    console.log(result);
  });
});

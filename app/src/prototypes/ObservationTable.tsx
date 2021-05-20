import React from 'react';
import { HotTable } from '@handsontable/react';

const ObservationTable: React.FC = () => {
  const data = [
    ['', 'Tesla', 'Mercedes', 'Toyota', 'Volvo'],
    ['2019', 10, 11, 12, 13],
    ['2020', 20, 11, 14, 13],
    ['2021', 30, 15, 12, 13]
  ];

  return <HotTable data={data} colHeaders={true} rowHeaders={true} width="600" height="300" />;
};

export default ObservationTable;

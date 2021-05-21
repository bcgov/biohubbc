import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';
import React from 'react';

import 'handsontable/dist/handsontable.min.css';
import './handsontable.scss';

const useStyles = makeStyles(() => ({
  hotTable: {}
}));

const ObservationTable: React.FC = () => {
  const classes = useStyles();

  const data = [
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,]
  ];

  return (
    <HotTable
      className={classes.hotTable}
      data={data}
      nestedHeaders={[
        ['Group No.', { label: 'Bulls', colspan: 2 }, { label: 'Cows', colspan: 3 }, { label: '', colspan: 3 }],
        ['', 'Yrlings', 'Mature', 'Lone', 'W/1 Calf', 'W/2 Calf', 'Lone Calf', 'Unk Ages/Sex', 'TOTAL']
      ]}
      rowHeaders={true}
      formulas={true}
      height={'500px'}
      licenseKey="non-commercial-and-evaluation"
    />
  );
};

export default ObservationTable;

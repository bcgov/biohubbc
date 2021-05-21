// @ts-nocheck
import React from 'react';
import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';

import 'handsontable/dist/handsontable.min.css';
import './handsontable.scss';

const useStyles = makeStyles(() => ({
  hotTable: {
    backgroundColor: 'red',
    '& td': {}
  }
}));

const ObservationTable: React.FC = () => {
  const classes = useStyles();

  const data = [
    [, , , , , , ],
    [, , , , , , ],
    [, , , , , , ],
    [, , , , , , ],
    [, , , , , , ],
    [, , , , , , ]
  ];

  return (
    <HotTable
      className={classes.hotTable}
      data={data}
      colHeaders={['Bull', 'Cow', 'Cow w/ 1 child', 'Cow w/ 2 child', 'Veg Coverage', 'Snow Coverage']}
      rowHeaders={true}
      formulas={true}
      height={'500px'}
      licenseKey="non-commercial-and-evaluation"
    />
  );
};

export default ObservationTable;

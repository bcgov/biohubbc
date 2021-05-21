import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';
import React, { useRef } from 'react';

import 'handsontable/dist/handsontable.min.css';
import './handsontable.scss';

const useStyles = makeStyles(() => ({
  hotTable: {},
  readOnly: {
    backgroundColor: 'grey'
  }
}));

const ObservationTable: React.FC = () => {
  const classes = useStyles();

  const hotRef = useRef<HotTable>(null);

  const headers = [
    ['Group No.', { label: 'Bulls', colspan: 2 }, { label: 'Cows', colspan: 3 }, { label: '', colspan: 7 }],
    [
      '',
      'Yrlings',
      'Mature',
      'Lone',
      'W/1 Calf',
      'W/2 Calf',
      'Lone Calf',
      'Unk Ages/Sex',
      'TOTAL',
      'Wpt No.',
      'Act.',
      '% Veg Cover',
      'Habitat notes/Other species/old trks/observer notes, etc.'
    ]
  ];

  const data = [
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,]
  ];

  return (
    <HotTable
      ref={hotRef}
      className={classes.hotTable}
      data={data}
      nestedHeaders={headers}
      viewportRowRenderingOffset={'auto'}
      contextMenu={true}
      rowHeaders={true}
      rowHeights={'50px'}
      colWidths={'75px'}
      afterChange={(changes, source) => {
        if (source === 'auto') {
          return;
        }

        changes?.forEach((change) => {
          const row = change[0];

          const rowData = hotRef.current?.hotInstance.getDataAtRow(row).slice(0, 8);

          const rowNumbers = rowData?.filter((item) => !isNaN(Number(item)));

          hotRef.current?.hotInstance.setDataAtCell(
            [[row, 8, rowNumbers?.splice(0, 8).reduce((a, b) => a + b, 0)]],
            'auto'
          );
        });
      }}
      columns={[
        {
          type: 'numeric',
          validator: function (this: any, value: any, callback: (valid: boolean) => void): void {
            if (isNaN(Number(value))) {
              callback(false);
              return;
            }

            if (value > 100) {
              callback(false);
              return;
            }

            callback(true);
          }
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric',
          readOnly: true
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'numeric'
        },
        {
          type: 'text'
        }
      ]}
      formulas={true}
      height={'500px'}
      licenseKey="non-commercial-and-evaluation"
    />
  );
};

export default ObservationTable;

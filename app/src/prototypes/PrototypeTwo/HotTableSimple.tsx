import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';
// import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.min.css';
import React, { useRef, useState } from 'react';
import './handsontable.scss';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  hotTable: {}
}));

const HotTableSimple: React.FC = () => {
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
      'Notes'
    ]
  ];

  const [data] = useState<any[][]>([[, , , , , , , , , , , , ,]]);

  const [settings] = useState<Handsontable.GridSettings>({
    data: data,
    nestedHeaders: headers,
    viewportRowRenderingOffset: 'auto',
    minRows: 8,
    contextMenu: true,
    collapsibleColumns: true,
    rowHeaders: true,
    search: true,
    width: '100%',
    height: '100%',
    rowHeights: 40,
    colWidths: 75,
    readOnly: false,
    columnSorting: true,
    formulas: true,
    manualColumnResize: true,
    manualRowResize: true,
    afterChange: (changes, source) => {
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
    },
    columns: [
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
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'numeric', readOnly: true },
      { type: 'numeric' },
      { type: 'numeric' },
      { type: 'dropdown', source: ['None', 'Mild', 'Medium', 'Dense'] },
      { type: 'text', width: 200 }
    ]
  });

  return (
    <Box mt={3}>
      {/* <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
          onClick={() =>
            setSettings((currentSettings) => {
              return { ...currentSettings, colWidths: (currentSettings.colWidths === 60 && 100) || 60 };
            })
          }>
          {`${(settings.colWidths === 60 && 'Expand') || 'Shrink'} Columns`}
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
          onClick={() =>
            setSettings((currentSettings) => {
              return { ...currentSettings, readOnly: !currentSettings.readOnly };
            })
          }>
          {`${(settings.readOnly && 'Unlock') || 'Lock'} Data`}
        </Button>
      </Box> */}
      <Box style={{ height: '400px' }}>
        <HotTable
          id="hot"
          ref={hotRef}
          className={classes.hotTable}
          settings={settings}
          licenseKey="non-commercial-and-evaluation"
        />
      </Box>
    </Box>
  );
};

export default HotTableSimple;

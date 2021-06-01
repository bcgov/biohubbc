import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';
// import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.min.css';
import React, { useState } from 'react';
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

export interface IHotTableSimpleProps {
  innerRef: React.RefObject<HotTable>;
}

const HotTableSimple: React.FC<IHotTableSimpleProps> = (props) => {
  const classes = useStyles();

  const headers = [
    [
      'Group No',
      'Wpt No',
      { label: 'Bulls', colspan: 2 },
      { label: 'Cows', colspan: 3 },
      { label: 'Unclassified', colspan: 2 },
      { label: '', colspan: 6 }
    ],
    [
      '',
      '',
      'Yrlings',
      'Mature',
      'Lone',
      'W/1 Calf',
      'W/2 Calf',
      'Lone Calf',
      'Unk Ages/Sex',
      'Activity',
      'TOTAL',
      '% Veg Cover',
      'Veg Class',
      '% Snow',
      'Comments'
    ]
  ];

  const [data] = useState<any[][]>([[, , , , , , , , , , , , , , ,]]);

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
    afterChange: (changes: any, source: any) => {
      if (source === 'auto') {
        return;
      }

      changes?.forEach((change: any) => {
        const row = change[0];

        const rowData = props.innerRef.current?.hotInstance.getDataAtRow(row).slice(2, 9);

        const rowNumbers = rowData?.filter((item: any) => !isNaN(Number(item)));

        props.innerRef.current?.hotInstance.setDataAtCell(
          [[row, 10, rowNumbers?.reduce((a: any, b: any) => a + b, 0)]],
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
      { type: 'numeric' },
      { type: 'dropdown', source: ['Bedded', 'Moving', 'Standing'] },
      { type: 'numeric', readOnly: true },
      {
        type: 'dropdown',
        source: [
          '0',
          '5',
          '10',
          '15',
          '20',
          '25',
          '30',
          '35',
          '40',
          '45',
          '50',
          '55',
          '60',
          '65',
          '70',
          '75',
          '80',
          '85',
          '90',
          '95',
          '100'
        ]
      },
      { type: 'dropdown', source: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      { type: 'numeric' },
      { type: 'text', width: 250 }
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
          ref={props.innerRef}
          className={classes.hotTable}
          settings={settings}
          licenseKey="non-commercial-and-evaluation"
        />
      </Box>
    </Box>
  );
};

export default HotTableSimple;

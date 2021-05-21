import { HotTable } from '@handsontable/react';
import { makeStyles } from '@material-ui/core';
import 'handsontable/dist/handsontable.min.css';
import useWindowDimensions from 'prototypes/useWindowDimensions';
import React, { useEffect, useRef, useState } from 'react';
import './handsontable.scss';

const useStyles = makeStyles(() => ({
  hotTable: {},
  readOnly: {
    backgroundColor: 'grey'
  }
}));

export interface IObservationTableProps {
  hotTableParentRef: any;
}

const ObservationTable: React.FC<IObservationTableProps> = (props) => {
  const classes = useStyles();

  const hotRef = useRef<HotTable>(null);

  // Used to trigger re-renders on window size changes
  useWindowDimensions();

  useEffect(() => {
    if (!props.hotTableParentRef?.current?.offsetWidth) {
      return;
    }

    setParentWidth(props.hotTableParentRef.current.offsetWidth);

    setColWidthsPixels(getColumnWidthsPixels(colWidthsPercent, props.hotTableParentRef.current.offsetWidth - 105));
  }, [props.hotTableParentRef, props.hotTableParentRef?.current, props.hotTableParentRef?.current?.offsetWidth]);

  const [colWidthsPixels, setColWidthsPixels] = useState<number[]>([]);
  const [parentWidth, setParentWidth] = useState<number>();

  const getColumnWidthsPixels = (colWidthsPercent: number[], parentWidth: number) => {
    return colWidthsPercent.map((item) => parentWidth * item);
  };

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

  const colWidthsPercent = [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.28];

  const [data] = useState<any[][]>([
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,],
    [, , , , , , , , , , , , ,]
  ]);

  return (
    <HotTable
      ref={hotRef}
      className={classes.hotTable}
      data={data}
      nestedHeaders={headers}
      viewportRowRenderingOffset={'auto'}
      width={parentWidth}
      minRows={60}
      contextMenu={true}
      collapsibleColumns={true}
      rowHeaders={true}
      search={true}
      columnSorting={true}
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
          },
          width: colWidthsPixels[0]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[1]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[2]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[3]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[4]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[5]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[6]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[7]
        },
        {
          type: 'numeric',
          readOnly: true,
          width: colWidthsPixels[8]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[9]
        },
        {
          type: 'numeric',
          width: colWidthsPixels[10]
        },
        {
          type: 'dropdown',
          source: ['yellow', 'red', 'orange', 'green', 'blue', 'gray', 'black', 'white'],
          width: colWidthsPixels[11]
        },
        {
          type: 'text',
          width: colWidthsPixels[12]
        }
      ]}
      formulas={true}
      height={'500px'}
      licenseKey="non-commercial-and-evaluation"
    />
  );
};

export default ObservationTable;

import Slider from '@mui/material/Slider';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';

interface IDateRangeSliderProps {
  label: string;
  onChange?: (value: [Dayjs, Dayjs]) => void;
  initialValue?: [Dayjs, Dayjs];
  minDate: Dayjs;
  maxDate: Dayjs;
}

export const DateRangeSlider = (props: IDateRangeSliderProps) => {
  const { onChange, initialValue, minDate, maxDate } = props;

  const minTimestamp = minDate.valueOf();
  const maxTimestamp = maxDate.valueOf();

  const [value, setValue] = React.useState<number[]>(
    initialValue ? [initialValue[0].valueOf(), initialValue[1].valueOf()] : [minTimestamp, maxTimestamp]
  );

  const handleChange = (_: Event, newValue: number[]) => {
    setValue(newValue);
    if (onChange) {
      onChange([dayjs(newValue[0]), dayjs(newValue[1])]);
    }
  };

  return (
    <Slider
      min={minTimestamp}
      max={maxTimestamp}
      value={value}
      onChange={(event, val) => {
        if (Array.isArray(val)) {
          handleChange(event, val);
        }
      }}
      valueLabelDisplay="auto"
      valueLabelFormat={(val) => dayjs(val).format('YYYY-MM-DD')}
    />
  );
};

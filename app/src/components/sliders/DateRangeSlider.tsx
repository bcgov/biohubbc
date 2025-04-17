import Slider from '@mui/material/Slider';
import * as React from 'react';

interface IDateRangeSliderProps {
  label: string;
  onChange?: (value: number[]) => void;
  initialValue?: number[];
}

export const DateRangeSlider = (props: IDateRangeSliderProps) => {
  const { onChange, initialValue } = props;
  const [value, setValue] = React.useState<number[]>(initialValue ?? []);

  const handleChange = (_: Event, newValue: number[]) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Slider
      value={value}
      onChange={(event, value) => {
        if (Array.isArray(value)) {
          handleChange(event, value);
        }
      }}
      valueLabelDisplay="auto"
    />
  );
};

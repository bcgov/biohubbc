import Slider from '@mui/material/Slider';
import dayjs, { Dayjs } from 'dayjs';

interface IDateRangeSliderProps {
  label: string;
  value: [Dayjs, Dayjs];
  onChange: (value: [Dayjs, Dayjs]) => void;
  minDate: Dayjs;
  maxDate: Dayjs;
}

export const DateRangeSlider = (props: IDateRangeSliderProps) => {
  const { value, onChange, minDate, maxDate } = props;

  const minTimestamp = minDate.valueOf();
  const maxTimestamp = maxDate.valueOf();

  const sliderValue = [value[0].valueOf(), value[1].valueOf()];

  const handleChange = (_: Event, newValue: number[]) => {
    if (Array.isArray(newValue)) {
      onChange([dayjs(newValue[0]), dayjs(newValue[1])]);
    }
  };

  return (
    <Slider
      min={minTimestamp}
      max={maxTimestamp}
      value={sliderValue}
      onChange={(event, value) => {
        if (Array.isArray(value)) {
          handleChange(event, value);
        }
      }}
      valueLabelDisplay="auto"
      valueLabelFormat={(val) => dayjs(val).format('YYYY-MM-DD')}
    />
  );
};

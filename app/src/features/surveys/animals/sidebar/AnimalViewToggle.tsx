import { mdiCalendarClock, mdiCloseOutline, mdiPaw, mdiRuler, mdiTag } from '@mdi/js';
import CustomToggleButtonGroup, { ToggleButtonView } from 'components/toggle/CustomToggleButtonGroup';
import { useMemo } from 'react';
import { ANIMAL_ACTIVE_VIEW_VALUE } from '../AnimalPage';

type AnimalViewToggleProps = {
  activeView: ANIMAL_ACTIVE_VIEW_VALUE;
  setActiveView: (v: ANIMAL_ACTIVE_VIEW_VALUE) => void;
};

export const AnimalViewToggle = (props: AnimalViewToggleProps) => {
  const { activeView, setActiveView } = props;

  const views: ToggleButtonView<ANIMAL_ACTIVE_VIEW_VALUE>[] = useMemo(
    () => [
      {
        value: ANIMAL_ACTIVE_VIEW_VALUE.animals,
        label: 'Animals',
        icon: mdiPaw
      },
      {
        value: ANIMAL_ACTIVE_VIEW_VALUE.captures,
        label: 'Captures',
        icon: mdiCalendarClock
      },
      {
        value: ANIMAL_ACTIVE_VIEW_VALUE.mortalities,
        label: 'Mortalities',
        icon: mdiCloseOutline
      },
      {
        value: ANIMAL_ACTIVE_VIEW_VALUE.measurements,
        label: 'Measurements',
        icon: mdiRuler
      },
      {
        value: ANIMAL_ACTIVE_VIEW_VALUE.markings,
        label: 'Markings',
        icon: mdiTag
      }
    ],
    []
  );

  return (
    <CustomToggleButtonGroup
      views={views}
      activeView={activeView}
      onViewChange={setActiveView}
      orientation="vertical"
    />
  );
};

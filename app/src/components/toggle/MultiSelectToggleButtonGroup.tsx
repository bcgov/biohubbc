import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
}

export const MultiSelectToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeViews,
  onViewChange,
  orientation = 'horizontal'
}: {
  views: ToggleButtonView<ViewValueType>[];
  activeViews: Set<ViewValueType>;
  onViewChange: (views: Set<ViewValueType>) => void;
  orientation?: 'horizontal' | 'vertical';
}) => {
  const handleToggle = (value: ViewValueType) => {
    const updated = new Set(activeViews);
    updated.has(value) ? updated.delete(value) : updated.add(value);
    onViewChange(updated);
  };

  return (
    <ToggleButtonGroup
      value={Array.from(activeViews)}
      orientation={orientation}
      exclusive={false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        gap: 1,
        '& .MuiToggleButton-root': {
          border: `1px solid ${grey[100]}`, // or 'none' if you don't want borders
          borderRadius: '9999px', // <== force fully rounded edges
          py: 1,
          px: 2,
          mb: 0.25,
          fontWeight: 700,
          letterSpacing: '0.02rem',
          justifyContent: orientation === 'horizontal' ? 'center' : 'flex-start',
          textTransform: 'none',
          minHeight: '36px'
        }
      }}>
      {views.map((view) => {
        const isActive = activeViews.has(view.value);

        return (
          <ToggleButton
            key={view.value}
            value={view.value}
            selected={isActive}
            onClick={() => handleToggle(view.value)}
            color="primary"
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.5,
              '& .MuiIconButton-root': { p: 0.25 }
            }}>
            <Box display="flex" alignItems="center" gap={1} flexGrow={1} minWidth={0}>
              {view.label}
              {isActive ? (
                <Icon
                  path={mdiClose}
                  size={0.8}
                  color={grey[700]}
                  style={{ backgroundColor: blueGrey[100], borderRadius: '500px', padding: 3 }}
                />
              ) : (
                <Icon path={mdiPlus} size={0.8} color={grey[500]} style={{ padding: 2 }} />
              )}
            </Box>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

import List from '@mui/material/List';
import { PropsWithChildren } from 'react';

/**
 * Returns a list with bullet points
 *
 * @returns
 */
export const BulletedList = (props: PropsWithChildren) => {
  return (
    <List
      disablePadding
      sx={{
        listStyleType: 'disc',
        pl: 2,
        '& .MuiListItem-root': {
          display: 'list-item',
          pb: 1
        }
      }}>
      {props.children}
    </List>
  );
};

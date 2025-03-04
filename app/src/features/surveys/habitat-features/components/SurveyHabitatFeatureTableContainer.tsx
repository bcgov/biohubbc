import { mdiCogOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, IconButton, Paper, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { useHabitatFeatureTableContext } from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import { SurveyHabitatFeatureTable } from './SurveyHabitatFeatureTable';

/**
 * Container for the Survey Habitat Feature Table.
 *
 * @return {*} {JSX.Element}
 */
export const SurveyHabitatFeatureTableContainer = (): JSX.Element => {
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Habitat Features &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({habitatFeatureTableContext.rowCount})
          </Typography>
        </Typography>

        <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.HABITAT_FEATURES} />

          <Tooltip title="Toggle column visibility">
            <IconButton onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}>
              <Icon path={mdiCogOutline} size={1} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="survey-observations-table-actions-menu"
            anchorEl={columnVisibilityMenuAnchorEl}
            open={Boolean(columnVisibilityMenuAnchorEl)}
            onClose={handleCloseColumnVisibilityMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <Box
              sx={{
                xs: { maxHeight: '300px' },
                lg: { maxHeight: '400px' }
              }}>
              {habitatFeatureTableContext.columns.map((column) => {
                return (
                  <MenuItem
                    dense
                    key={column.field}
                    onClick={() => habitatFeatureTableContext.toggleColumnVisibility(column.field)}>
                    <Checkbox checked={!habitatFeatureTableContext.hiddenColumns.includes(column.field)} />
                    <ListItemText>{column.headerName}</ListItemText>
                  </MenuItem>
                );
              })}
            </Box>
          </Menu>
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <SurveyHabitatFeatureTable />
        </Box>
      </Box>
    </Paper>
  );
};

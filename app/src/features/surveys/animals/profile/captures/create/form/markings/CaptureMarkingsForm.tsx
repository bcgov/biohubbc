import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Stack } from '@mui/system';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import CaptureMarkingsDialog from './CaptureMarkingsDialog';
import MarkingCard from './MarkingCard';

/**
 * Returns the control for applying markings to an animal on the animal capture form
 *
 * @returns
 */
const CaptureMarkingsForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [selectedMarking, setSelectedMarking] = useState<number | null>(null);
  const [markingAnchorEl, setMarkingAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const { values } = useFormikContext<ICreateEditCaptureRequest>();

  const critterbaseApi = useCritterbaseApi();

  const { critterDataLoader } = useAnimalPageContext();

  // Get available marking types
  const markingTypesDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingTypeOptions());

  // Get available marking body positions
  const markingBodyLocationDataLoader = useDataLoader((tsn: number) =>
    critterbaseApi.marking.getMarkingBodyLocationOptions(tsn)
  );

  // Get available marking colours
  const markingColoursDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingColourOptions());

  markingTypesDataLoader.load();
  markingColoursDataLoader.load();
  if (critterDataLoader.data) {
    markingBodyLocationDataLoader.load(critterDataLoader.data.itis_tsn);
  }

  return (
    <FieldArray
      name="markings"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          {/* CONTEXT MENU ACTIONS ON MARKING */}
          {selectedMarking !== null && (
            <Menu
              sx={{ pb: 2 }}
              open={Boolean(markingAnchorEl)}
              onClose={() => {
                setMarkingAnchorEl(null);
                setSelectedMarking(null);
              }}
              anchorEl={markingAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}>
              <MenuItem
                onClick={() => {
                  setMarkingAnchorEl(null);
                  setIsDialogOpen(true);
                }}>
                <ListItemIcon>
                  <Icon path={mdiPencilOutline} size={1} />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  arrayHelpers.remove(selectedMarking);
                  setMarkingAnchorEl(null);
                  setSelectedMarking(null);
                }}>
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          )}

          {/* ADD/EDIT MARKING DIALOG */}
          <CaptureMarkingsDialog
            initialValues={selectedMarking !== null ? values.markings[selectedMarking] : undefined}
            markingBodyLocations={markingBodyLocationDataLoader.data ?? []}
            markingColours={markingColoursDataLoader.data ?? []}
            markingTypes={markingTypesDataLoader.data ?? []}
            isDialogOpen={isDialogOpen}
            handleSave={(data) => {
              selectedMarking !== null ? arrayHelpers.replace(selectedMarking, data) : arrayHelpers.push(data);
              setIsDialogOpen(false);
              setSelectedMarking(null);
            }}
            handleClose={() => {
              setIsDialogOpen(false);
              setSelectedMarking(null);
            }}
          />

          {/* MARKING CARDS */}
          <Stack gap={3}>
            <TransitionGroup>
              {values.markings.map((marking, index) => (
                <Collapse key={marking.marking_id ?? marking._id}>
                  <MarkingCard
                    identifier={marking.identifier}
                    comment={marking.comment}
                    primary_colour_label={
                      markingColoursDataLoader.data?.find((colour) => colour.colour_id == marking.primary_colour_id)
                        ?.colour
                    }
                    secondary_colour_label={
                      markingColoursDataLoader.data?.find((colour) => colour.colour_id == marking.secondary_colour_id)
                        ?.colour
                    }
                    marking_type_label={
                      markingTypesDataLoader.data?.find((type) => type.marking_type_id == marking.marking_type_id)
                        ?.name ?? ''
                    }
                    marking_body_location_label={
                      markingBodyLocationDataLoader.data?.find(
                        (body_location) =>
                          body_location.taxon_marking_body_location_id == marking.taxon_marking_body_location_id
                      )?.body_location ?? ''
                    }
                    handleMarkingMenuClick={(event) => {
                      setMarkingAnchorEl(event.currentTarget);
                      setSelectedMarking(index);
                    }}
                  />
                </Collapse>
              ))}
            </TransitionGroup>
          </Stack>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add marking"
            onClick={() => setIsDialogOpen(true)}>
            Add Marking
          </Button>
        </>
      )}
    />
  );
};

export default CaptureMarkingsForm;

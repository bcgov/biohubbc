import { mdiCalendarRangeOutline, mdiPlus,} from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import Menu, { MenuProps } from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { getCodesName } from 'utils/Utils';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
// import CreateSamplingMethod from './CreateSamplingMethod';
// import EditSamplingMethod from './EditSamplingMethod';
import { IEditSurveySampleMethodData } from './MethodForm';
import { SurveyContext } from 'contexts/surveyContext';
import { alphabetizeObjects } from 'utils/Utils';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SelectWithSubtextField from 'components/fields/SelectWithSubtext';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import Grid from '@mui/material/Grid';

export interface ISamplingBlockStratumFormProps {
  // intended_outcomes: ISelectWithSubtextFieldOption[];
  survey_blocks: ISelectWithSubtextFieldOption[];
}

const SamplingBlockStratumForm = () => {

  const { values, errors, setFieldValue, validateField } = useFormikContext<ICreateSamplingSiteRequest>();
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<IEditSurveySampleMethodData | undefined>(undefined);


  const handleDelete = () => {
    if (editData) {
      const data = values.methods;
      data.splice(editData.index, 1);
      setFieldValue('methods', data);
    }
    setAnchorEl(null);
  };


  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext)

  const surveyBlocks = surveyContext.surveyDataLoader?.data?.surveyData?.blocks.map((block) => ({value: block.survey_block_id, label: block.name, subText: block?.description}))
  const stratums = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums.map((stratum) => ({value: stratum.survey_stratum_id, label: stratum.name, subText: stratum?.description || undefined}))

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  // const formikProps = useFormikContext<ICreateSurveyRequest>();
    return (<>
      <Box component="fieldset">
        <form>
          <Box component="fieldset">
            <Typography component="legend">Assign to Sampling Site Group</Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                mb: 3,
                maxWidth: '92ch'
              }}
            >
              All sampling sites uploaded together will be assigned to the selected Sampling Site Groups. These can be modified later if required.
            </Typography>
            {surveyBlocks ? (
            <>
              <SelectWithSubtextField       
                id="sampling-site-groups"
                label="Sampling Site Group"
                name='sampling-site-groups'
                options={surveyBlocks}
              />
              <Box mt={2}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label="add permit"
                  startIcon={<Icon path={mdiPlus} size={1} />}>
                  Add Sampling Site Group
                </Button>
              </Box>
            </>
            ) : null}
          </Box>

           <Box component="fieldset" mt={5}>
      
          <Typography component="legend">Assign to Stratum</Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              mb: 3,
              maxWidth: '92ch'
            }}>
            All sampling sites uploaded together will be assigned to the selected Stratum. These can be modified later if required.
          </Typography>
          {stratums ?
          <>
            <SelectWithSubtextField       
                id="Stratum"
                label="Stratum"
                name='Stratum'
                options={stratums}>
            </SelectWithSubtextField>
            <Box mt={2}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    aria-label="add permit"
                    startIcon={<Icon path={mdiPlus} size={1} />}>
                    Add Stratum
                  </Button>
                </Box>
              </>
           : null
           }
          </Box>
                
        </form>
      </Box></>)
}

export default SamplingBlockStratumForm;

// import { mdiCalendarRangeOutline, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
// import Icon from '@mdi/react';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
// import Collapse from '@mui/material/Collapse';
// import { grey } from '@mui/material/colors';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import Menu, { MenuProps } from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import { CodesContext } from 'contexts/codesContext';
// import { useFormikContext } from 'formik';
// import { useContext, useEffect, useState } from 'react';
// import { TransitionGroup } from 'react-transition-group';
// import { getCodesName } from 'utils/Utils';
// import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
// import CreateSamplingMethod from './CreateSamplingMethod';
// import EditSamplingMethod from './EditSamplingMethod';
// import { IEditSurveySampleMethodData } from './MethodForm';

// const SamplingMethodForm = () => {
//   const { values, errors, setFieldValue, validateField } = useFormikContext<ICreateSamplingSiteRequest>();
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
//   const [editData, setEditData] = useState<IEditSurveySampleMethodData | undefined>(undefined);

//   const codesContext = useContext(CodesContext);
//   useEffect(() => {
//     codesContext.codesDataLoader.load();
//   }, [codesContext.codesDataLoader]);

//   const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
//     setAnchorEl(event.currentTarget);
//     setEditData({ ...values.methods[index], index });
//   };

//   const handleDelete = () => {
//     if (editData) {
//       const data = values.methods;
//       data.splice(editData.index, 1);
//       setFieldValue('methods', data);
//     }
//     setAnchorEl(null);
//   };

//   return (
//     <>
//       {/* CREATE SAMPLE METHOD DIALOG */}
      // <CreateSamplingMethod
//         open={isCreateModalOpen}
//         onSubmit={(data) => {
//           setFieldValue(`methods[${values.methods.length}]`, data);
//           validateField('methods');
//           setAnchorEl(null);
//           setIsCreateModalOpen(false);
//         }}
//         onClose={() => {
//           setAnchorEl(null);
//           setIsCreateModalOpen(false);
//         }}
//       />

//       {/* EDIT SAMPLE METHOD DIALOG */}
//       <EditSamplingMethod
//         initialData={editData}
//         open={isEditModalOpen}
//         onSubmit={(data, index) => {
//           setFieldValue(`methods[${index}]`, data);
//           setAnchorEl(null);
//           setIsEditModalOpen(false);
//         }}
//         onClose={() => {
//           setAnchorEl(null);
//           setIsEditModalOpen(false);
//         }}
//       />

//       <Menu
//         open={Boolean(anchorEl)}
//         onClose={() => setAnchorEl(null)}
//         anchorEl={anchorEl}
//         anchorOrigin={{
//           vertical: 'top',
//           horizontal: 'right'
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'right'
//         }}>
//         <MenuItem onClick={() => setIsEditModalOpen(true)}>
//           <ListItemIcon>
//             <Icon path={mdiPencilOutline} size={1} />
//           </ListItemIcon>
//           Edit Details
//         </MenuItem>
//         <MenuItem onClick={() => handleDelete()}>
//           <ListItemIcon>
//             <Icon path={mdiTrashCanOutline} size={1} />
//           </ListItemIcon>
//           Remove
//         </MenuItem>
//       </Menu>

//       <Box component="fieldset">
//         <form>
//           <Typography component="legend">Add Sampling Methods</Typography>
//           <Typography
//             variant="body1"
//             color="textSecondary"
//             sx={{
//               mb: 3,
//               maxWidth: '92ch'
//             }}>
//             Methods added here will be applied to ALL sampling locations. These can be modified later if required.
//           </Typography>
//           {errors.methods && !Array.isArray(errors.methods) && (
//             <Alert
//               sx={{
//                 my: 1
//               }}
//               severity="error">
//               <AlertTitle>Missing sampling method</AlertTitle>
//               {errors.methods}
//             </Alert>
//           )}
//           <Stack component={TransitionGroup} gap={1.5}>
//             {values.methods.map((item, index) => (
//               <Collapse key={`sample_method_${item.method_lookup_id || Math.random()}`}>
//                 <Card
//                   variant="outlined"
//                   sx={{
//                     background: grey[100]
//                   }}>
//                   <CardHeader
//                     title={`${getCodesName(
//                       codesContext.codesDataLoader.data,
//                       'sample_methods',
//                       item.method_lookup_id || 0
//                     )}`}
//                     action={
//                       <IconButton
//                         onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
//                           handleMenuClick(event, index)
//                         }
//                         aria-label="settings">
//                         <MoreVertIcon />
//                       </IconButton>
//                     }
//                   />
//                   <CardContent
//                     sx={{
//                       pt: 0,
//                       pb: '12px !important'
//                     }}>
//                     <Stack gap={3}>
//                       {item.description && (
//                         <Typography
//                           variant="body2"
//                           color="textSecondary"
//                           sx={{
//                             display: '-webkit-box',
//                             WebkitLineClamp: '2',
//                             WebkitBoxOrient: 'vertical',
//                             maxWidth: '92ch',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis'
//                           }}>
//                           {item.description}
//                         </Typography>
//                       )}
//                       <Box>
//                         <Typography variant="body1" fontWeight={700}>
//                           Time Periods
//                         </Typography>
//                         <Divider component="div" sx={{ mt: 1 }}></Divider>
//                         <List dense disablePadding>
//                           {item.periods.map((period) => (
//                             <ListItem
//                               key={`sample_period_${period.survey_sample_period_id || Math.random()}`}
//                               divider
//                               disableGutters
//                               sx={{ pl: 1.25 }}>
//                               <ListItemIcon sx={{ minWidth: '32px' }}>
//                                 <Icon path={mdiCalendarRangeOutline} size={0.75} />
//                               </ListItemIcon>
//                               <ListItemText
//                                 primary={`${period.start_date} ${period.start_time || ''} - ${period.end_date} ${
//                                   period.end_time || ''
//                                 }`}
//                               />
//                             </ListItem>
//                           ))}
//                         </List>
//                       </Box>
//                     </Stack>
//                   </CardContent>
//                 </Card>
//               </Collapse>
//             ))}
//             <Button
//               sx={{
//                 alignSelf: 'flex-start'
//               }}
//               data-testid="create-sample-method-add-button"
//               variant="outlined"
//               color="primary"
//               title="Add Sample Method"
//               aria-label="Add Sample Method"
//               startIcon={<Icon path={mdiPlus} size={1} />}
//               onClick={() => {
//                 setIsCreateModalOpen(true);
//               }}>
//               Add Method
//             </Button>
//           </Stack>
//         </form>
//       </Box>
//     </>
//   );
// };

// export default SamplingMethodForm;

// import { mdiPlus,} from '@mdi/js';
// import Icon from '@mdi/react';
// // import MoreVertIcon from '@mui/icons-material/MoreVert';
// // import Alert from '@mui/material/Alert';
// // import AlertTitle from '@mui/material/AlertTitle';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// // import Card from '@mui/material/Card';
// // import CardContent from '@mui/material/CardContent';
// // import CardHeader from '@mui/material/CardHeader';
// // import Collapse from '@mui/material/Collapse';
// // import { grey } from '@mui/material/colors';
// // import Divider from '@mui/material/Divider';
// // import IconButton from '@mui/material/IconButton';
// // import List from '@mui/material/List';
// // import ListItem from '@mui/material/ListItem';
// // import ListItemIcon from '@mui/material/ListItemIcon';
// // import ListItemText from '@mui/material/ListItemText';
// // import MenuItem from '@mui/material/MenuItem';
// // import Select from '@mui/material/Select';
// // import Autocomplete from '@mui/material/Autocomplete';
// // import { MenuProps } from '@mui/material/Menu';
// // import MenuItem from '@mui/material/MenuItem';
// // import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import { CodesContext } from 'contexts/codesContext';
// // import { useFormikContext } from 'formik';
// import { useContext, useEffect } from 'react';
// // // import { TransitionGroup } from 'react-transition-group';
// // // import { getCodesName } from 'utils/Utils';
// import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
// // // import CreateSamplingMethod from './CreateSamplingMethod';
// // // import EditSamplingMethod from './EditSamplingMethod';
// // import { IEditSurveySampleMethodData } from './MethodForm';
// import { SurveyContext } from 'contexts/surveyContext';
// // import { alphabetizeObjects } from 'utils/Utils';
// // import FormControl from '@mui/material/FormControl';
// // import InputLabel from '@mui/material/InputLabel';
// import SelectWithSubtextField from 'components/fields/SelectWithSubtext';
// // import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
// import { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
// import { IBlockData } from './BlockForm';
// import { useFormikContext } from 'formik';

// export interface ISamplingBlockStratumFormProps {
//   // intended_outcomes: ISelectWithSubtextFieldOption[];
//   survey_blocks: ISelectWithSubtextFieldOption[];
// }


// const SamplingBlockForm = () => {

//   const { values, errors, setFieldValue, validateField } = useFormikContext<ICreateSamplingSiteRequest>();
//   // const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
//   // const [editData, setEditData] = useState<IEditSurveySampleMethodData | undefined>(undefined);


//   // const handleDelete = () => {
//   //   if (editData) {
//   //     const data = values.methods;
//   //     data.splice(editData.index, 1);
//   //     setFieldValue('methods', data);
//   //   }
//   //   setAnchorEl(null);
//   // };


//   const codesContext = useContext(CodesContext);
//   const surveyContext = useContext(SurveyContext)

//   const surveyBlocks = surveyContext.surveyDataLoader?.data?.surveyData?.blocks.map((block) => ({value: block.survey_block_id, label: block.name, subText: block?.description}))
  
//   const samplingSiteBlocksInitialValues: IBlockData = ({
//     survey_block_id: 0,
//       name: '',
//       description: '',
//   })

//   useEffect(() => {
//     codesContext.codesDataLoader.load();
//   }, [codesContext.codesDataLoader]);

//   // const formikProps = useFormikContext<ICreateSurveyRequest>();
//     return (<>
//       <Box component="fieldset">
//         <form>
//           <Box component="fieldset">
//             <Typography component="legend">Assign to Sampling Site Group</Typography>
//             <Typography
//               variant="body1"
//               color="textSecondary"
//               sx={{
//                 mb: 3,
//                 maxWidth: '92ch'
//               }}
//             >
//               All sampling sites uploaded together will be assigned to the selected Sampling Site Groups. These can be modified later if required.
//             </Typography>
//             {surveyBlocks ? (
//             <Box 
//                 sx={{width: {sm: '100%', md: '50%'}}}>
//               <SelectWithSubtextField       
//                 id="sampling-site-groups"
//                 label="Sampling Site Group"
//                 name='sampling-site-groups'
//                 options={surveyBlocks}
//               />
//               <Box mt={2}>
//                 <Button
//                   type="button"
//                   variant="outlined"
//                   color="primary"
//                   aria-label="add permit"
//                   onClick={() => arrayHelpers.push(SurveyPermitFormArrayItemInitialValues)}>
//                   startIcon={<Icon path={mdiPlus} size={1} />}>
//                   Add Group
//                 </Button>
//               </Box>
//             </Box>
//             ) : null}
//           </Box>

//            <Box component="fieldset" mt={5}>
      
//           </Box>
                
//         </form>
//       </Box></>)
// }

// export default SamplingBlockStratumForm;

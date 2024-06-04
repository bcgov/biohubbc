import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { getIn, useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';
import { ISurveySampleMethodData } from '../../../create/form/MethodForm';
import EditSamplingPeriod from '../../edit/form/EditSamplingPeriod';
import CreateSamplingPeriod from './CreateSamplingPeriod';

export interface ISurveySampleMethodPeriodData {
  survey_sample_period_id: number | null;
  survey_sample_method_id: number | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

export const SurveySampleMethodPeriodArrayItemInitialValues = {
  survey_sample_period_id: null,
  survey_sample_method_id: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

export const SurveySampleMethodDataInitialValues = {
  survey_sample_method_id: null,
  survey_sample_site_id: null,
  description: '',
  sample_periods: [SurveySampleMethodPeriodArrayItemInitialValues],
  method_response_metric_id: '' as unknown as null
};

export const SamplingSiteMethodPeriodYupSchema = yup
  .object({
    start_date: yup.string().typeError('Start Date is required').isValidDateString().required('Start Date is required'),
    end_date: yup
      .string()
      .typeError('End Date is required')
      .isValidDateString()
      .required('End Date is required')
      .isEndDateSameOrAfterStartDate('start_date'),
    start_time: yup.string().when('end_time', {
      is: (val: string | null) => val && val !== null,
      then: yup.string().typeError('Start Time is required').required('Start Time is required'),
      otherwise: yup.string().nullable()
    }),
    end_time: yup.string().nullable()
  })
  .test('checkDatesAreSameAndEndTimeIsAfterStart', 'End date must be after start date', function (value) {
    const { start_date, end_date, start_time, end_time } = value;

    if (start_date === end_date && start_time && end_time) {
      return dayjs(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
        dayjs(`${end_date} ${end_time}`, 'YYYY-MM-DD HH:mm:ss')
      );
    }
    return true;
  });

interface IMethodPeriodFormProps {
  survey_sample_method: ISurveySampleMethodData;
  method_technique_id: number;
  index: number;
}

/**
 * Form for adding sampling periods
 *
 * @returns
 */
const MethodPeriodForm = (props: IMethodPeriodFormProps) => {
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();
  const { errors, setFieldValue, setErrors } = formikProps;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [editData, setEditData] = useState<{ data: ISurveySampleMethodPeriodData; index: number } | undefined>(
    undefined
  );

  const sample_periods = props.survey_sample_method.sample_periods;

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    setEditData({ data: sample_periods[index], index });
  };

  const handleDelete = () => {
    if (editData) {
      const data = sample_periods;
      data.splice(editData.index, 1);
      setFieldValue(`sample_methods[${props.index}].sample_periods`, data);
    }
    setAnchorEl(null);
  };

  const clearErrors = (index: number) => {
    const updatedErrors = { ...errors };

    if (updatedErrors.sample_methods && Array.isArray(updatedErrors.sample_methods)) {
      updatedErrors.sample_methods[index] = {};
    }

    setErrors(updatedErrors);
  };

  return (
    <>
      {/* CREATE SAMPLE METHOD DIALOG */}
      <CreateSamplingPeriod
        open={isCreateModalOpen}
        onSubmit={(data) => {
          setFieldValue(`sample_methods[${props.index}].sample_periods[${sample_periods.length}]`, data);
          setAnchorEl(null);
          setIsCreateModalOpen(false);
          clearErrors(props.index);
        }}
        onClose={() => {
          setAnchorEl(null);
          setIsCreateModalOpen(false);
        }}
      />

      {/* EDIT SAMPLE METHOD DIALOG */}
      {editData?.data && (
        <EditSamplingPeriod
          initialData={editData?.data}
          open={isEditModalOpen}
          onSubmit={(data) => {
            setFieldValue(`sample_methods[${props.index}].sample_periods[${editData?.index}]`, data);
            setAnchorEl(null);
            setIsEditModalOpen(false);
          }}
          onClose={() => {
            setAnchorEl(null);
            setIsEditModalOpen(false);
          }}
        />
      )}

      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem onClick={() => setIsEditModalOpen(true)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => handleDelete()}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>

      {getIn(errors, `sample_methods[${props.index}].sample_periods`) !== undefined && (
        <Alert
          sx={{
            mb: 1
          }}
          severity="error">
          <AlertTitle>Missing sampling period</AlertTitle>
          {getIn(errors, `sample_methods[${props.index}].sample_periods`)}
        </Alert>
      )}

      <Stack component={TransitionGroup} gap={1.5}>
        {sample_periods?.map((item, index) => (
          <Collapse key={`sample_method_${item.survey_sample_period_id || index}`}>
            <Card
              variant="outlined"
              sx={{
                background: grey[100],
                border: `1px solid ${grey[400]}`,
                '& .MuiCardHeader-root': {
                  pb: 1
                }
              }}>
              <CardHeader
                title={
                  <>
                    {dayjs(item.start_date).format(DATE_FORMAT.MediumDateFormat)}&nbsp;&ndash;&nbsp;
                    {dayjs(item.end_date).format(DATE_FORMAT.MediumDateFormat)}
                  </>
                }
                action={
                  <IconButton
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleMenuClick(event, index)}
                    aria-label="settings">
                    <GridMoreVertIcon />
                  </IconButton>
                }
              />
              <CardContent
                sx={{
                  pt: 0,
                  pb: '6px !important'
                }}>
                {/* <Stack gap={2}><MethodPeriodForm /></Stack> */}
              </CardContent>
            </Card>
          </Collapse>
        ))}

        <Button
          sx={{
            alignSelf: 'flex-start',
            mt: 1
          }}
          data-testid="sampling-period-add-button"
          variant="outlined"
          color="primary"
          title="Add Period"
          aria-label="Create Sample Period"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => {
            setIsCreateModalOpen(true);
          }}>
          Add Period
        </Button>
      </Stack>
    </>
  );
};

export default MethodPeriodForm;

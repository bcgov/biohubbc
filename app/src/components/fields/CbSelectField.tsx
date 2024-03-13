import { FormControlProps, MenuItem, SelectChangeEvent } from '@mui/material';
import { useFormikContext } from 'formik';
import { ICbSelectRows, SelectOptionsProps } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { startCase } from 'lodash-es';
import get from 'lodash-es/get';
import { useEffect, useMemo } from 'react';
import { CbSelectWrapper } from './CbSelectFieldWrapper';

export interface ICbSelectSharedProps {
  name: string;
  label: string;
  controlProps?: FormControlProps;
}

export type ICbSelectField = ICbSelectSharedProps &
  SelectOptionsProps & {
    id: string;
    disabledValues?: Record<string, boolean>;
    handleChangeSideEffect?: (value: string, label: string) => void;
  };

interface ICbSelectOption {
  value: string | number;
  label: string;
}
/**
 * Critterbase Select Field. Handles data retrieval, formatting and error handling.
 *
 * @param {ICbSelectField} props
 * @return {*}
 *
 */
const CbSelectField = (props: ICbSelectField) => {
  const { name, orderBy, label, route, query, handleChangeSideEffect, controlProps, disabledValues } = props;

  const critterbaseApi = useCritterbaseApi();

  const { data, refresh } = useDataLoader(critterbaseApi.lookup.getSelectOptions);
  const { values, handleChange } = useFormikContext<ICbSelectOption>();

  const val = get(values, name) ?? '';

  const selectParams = { route, query, orderBy };

  useEffect(() => {
    // Skip fetching if route ends with an undefined id
    // example: /xref/collection-units/{undefined}
    if (route.endsWith('/')) {
      return;
    }
    refresh(selectParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectParams)]);

  const isValueInRange = useMemo(() => {
    if (val === '') {
      return true;
    }
    if (!data) {
      return false;
    }
    const inRange = data.some((d) => (typeof d === 'string' ? d === val : d.id === val));

    return inRange;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, val, name]);

  const innerChangeHandler = (e: SelectChangeEvent<any>) => {
    handleChange(e);
    // useful for when the select item label is needed in parent component
    if (handleChangeSideEffect) {
      const item = data?.find((a) => typeof a !== 'string' && a.id === e.target.value);
      handleChangeSideEffect(e.target.value, (item as ICbSelectRows).value);
    }
  };

  return (
    <CbSelectWrapper
      name={name}
      label={label}
      controlProps={{ ...controlProps, disabled: controlProps?.disabled || !data?.length }}
      onChange={innerChangeHandler}
      value={isValueInRange ? val : ''}>
      {data?.map((a) => {
        const item = typeof a === 'string' ? { label: a, value: a } : { label: a.value, value: a.id };
        return (
          <MenuItem disabled={disabledValues?.[item.value]} key={item.value} value={item.value}>
            {startCase(item.label)}
          </MenuItem>
        );
      })}
    </CbSelectWrapper>
  );
};

export default CbSelectField;

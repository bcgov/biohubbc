import { FormControlProps, MenuItem, SelectChangeEvent } from '@mui/material';
import { useFormikContext } from 'formik';
import { ICbRouteKey, ICbSelectRows } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React, { useEffect, useMemo } from 'react';
import { CbSelectWrapper } from './CbSelectFieldWrapper';

export interface ICbSelectSharedProps {
  name: string;
  label: string;
  controlProps?: FormControlProps;
}

export interface ICbSelectField extends ICbSelectSharedProps {
  id: string;
  route: ICbRouteKey;
  param?: string;
  query?: string;
  handleChangeSideEffect?: (value: string, label: string) => void;
}

interface ICbSelectOption {
  value: string | number;
  label: string;
}
/**
 * Critterbase Select Field. Handles data retrieval, formatting and error handling.
 *
 * @param {ICbSelectField}
 * @return {*}
 *
 **/

const CbSelectField: React.FC<ICbSelectField> = (props) => {
  const { name, label, route, param, query, handleChangeSideEffect, controlProps } = props;

  const api = useCritterbaseApi();
  const { data, load, refresh, hasLoaded } = useDataLoader(api.lookup.getSelectOptions);
  const { values, handleChange, setFieldValue, setFieldTouched } = useFormikContext<ICbSelectOption>();

  const val = get(values, name) ?? '';

  load({ route, param, query });

  useEffect(() => {
    if (hasLoaded) {
      // Only refresh when the query or param changes
      refresh({ route, param, query });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, param]);

  useMemo(() => {
    if (val === '') return;
    if (!data) return;
    const inRange = data.some((d) => (typeof d === 'string' ? d === val : d.id === val));
    if (!inRange) {
      setFieldValue(name, '');
      setFieldTouched(name);
    }
  }, [data, val, setFieldValue, setFieldTouched, name]);

  const innerChangeHandler = (e: SelectChangeEvent<any>) => {
    handleChange(e);
    if (handleChangeSideEffect) {
      const item = data?.find((a) => typeof a !== 'string' && a.id === e.target.value);
      handleChangeSideEffect(e.target.value, (item as ICbSelectRows).value);
    }
  };

  return (
    <CbSelectWrapper
      name={name}
      label={label}
      controlProps={{ ...controlProps, disabled: !data?.length }}
      onChange={innerChangeHandler}
      value={val}>
      {data?.map((a) => {
        const item = typeof a === 'string' ? { label: a, value: a } : { label: a.value, value: a.id };
        return (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        );
      })}
    </CbSelectWrapper>
  );
};

export default CbSelectField;

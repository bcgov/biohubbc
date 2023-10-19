import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export interface IRegionOption {
  key: string;
  name: string;
}

export interface IRegionSelectorProps {
  onRegionSelected: (data: IRegionOption | null) => void;
}

export const RegionSelector = (props: IRegionSelectorProps) => {
  const regions: IRegionOption[] = [
    {
      key: 'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW',
      name: 'Wildlife Management Units'
    },
    {
      key: 'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
      name: 'Parks and EcoRegions'
    },
    {
      key: 'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG',
      name: 'NRM Regional Boundaries'
    }
  ];

  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);

  const handleOnChange = (selected: IRegionOption | null) => {
    setSelectedRegion(selected);
    props.onRegionSelected(selected);
  };

  const handleCheckOptionEquality = (option: IRegionOption, value: IRegionOption) => {
    return option.key === value.key;
  };

  return (
    <>
      <Autocomplete
        id="layer"
        size="medium"
        sx={{ width: 250, fontSize: 14 }}
        options={regions}
        value={selectedRegion}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={handleCheckOptionEquality}
        renderInput={(params) => (
          <TextField {...params} variant="standard" label="Region Select" placeholder="Regions" />
        )}
        onChange={(_, option) => {
          handleOnChange(option);
        }}
      />
    </>
  );
};

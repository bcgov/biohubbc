import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export interface IRegionOption {
  key: string;
  name: string;
}

export interface IRegionSelectorProps {
  selectedRegion: IRegionOption | null;
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
    },
    {
      key: 'pub:WHSE_WILDLIFE_INVENTORY.GCPB_CARIBOU_POPULATION_SP',
      name: 'Caribou Population Units'
    }
  ];

  const handleOnChange = (selected: IRegionOption | null) => {
    props.onRegionSelected(selected);
  };

  const handleCheckOptionEquality = (option: IRegionOption, value: IRegionOption) => {
    return option.key === value.key;
  };

  return (
    <Autocomplete
      id="layer"
      size="small"
      options={regions}
      value={props.selectedRegion}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={handleCheckOptionEquality}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          aria-label="Select a layer"
          label=""
          placeholder="Select a layer"
        />
      )}
      onChange={(_, option) => {
        handleOnChange(option);
      }}
      sx={{
        width: 250,
        '& .MuiInputBase-root': {
          fontSize: '0.875rem'
        }
      }}
    />
  );
};

/* eslint-disable prettier/prettier */
const yN = [
  { name: 'Y', description: '' },
  { name: 'N', description: '' }
];

const AircraftType = [
  { name: 'Bell JetRanger', description: '' },
  { name: 'Bell JetRanger with bubble window', description: '' },
  { name: 'Bell JetRanger without bubble window', description: '' },
  { name: 'Bell LongRanger', description: '' },
  { name: 'Hiller 12E4', description: '' },
  { name: 'Hughes 500D', description: '' },
  { name: 'Cessna 172', description: '' },
  { name: 'Cessna 180', description: '' },
  { name: 'Cessna 182', description: '' },
  { name: 'Cessna 185', description: '' },
  { name: 'Cessna 206', description: '' },
  { name: 'SuperCub', description: '' },
  { name: 'Beaver', description: '' },
  { name: 'Single Otter', description: '' },
  { name: 'Twin Otter', description: '' },
  { name: 'Bell 406', description: '' },
  { name: 'A-Star', description: '' }
];

const Light = [
  { name: 'Bright', description: '' },
  { name: 'Flat', description: '' },
  { name: 'Shady', description: '' }
];

const UTMZone = [
  { name: '7', description: '' },
  { name: '8', description: '' },
  { name: '9', description: '' },
  { name: '10', description: '' },
  { name: '11', description: '' }
];

const GPSDatum = [
  { name: 'NAD27', description: '' },
  { name: 'NAD83', description: '' },
  { name: 'WGS84', description: '' }
];

const LatLongUnits = [
  { name: 'Decimal Degrees', description: '' },
  { name: 'Degrees, Minute, Seconds', description: '' },
  { name: 'Degrees and Decimal Minutes', description: '' }
];

const ActivityObservation = [
  { name: 'Standing' },
  { name: 'Bedding' },
  { name: 'Running' },
  { name: 'Walking' },
  { name: 'Not Moving' },
  { name: 'Moving' }
];

const SearchType = [{ name: 'Survey' }, { name: 'Telemetry' }];

const TargetType = [{ name: 'Targeted' }, { name: 'Non-Targeted' }];

const MarkType = [
  { name: 'GPS', description: '' },
  { name: 'VHF', description: '' },
  { name: 'Ear tag', description: '' },
  { name: 'Alternate Animal ID', description: '' },
  { name: 'Neckband', description: '' },
  { name: 'Branded', description: '' },
  { name: 'Horn', description: '' },
  { name: 'Mammals - Ear switches', description: '' },
  { name: 'Back tag', description: '' },
  { name: 'Leg band', description: '' },
  { name: 'Nasal', description: '' },
  { name: 'Streamer', description: '' },
  { name: 'Passive Integrated Transponder', description: '' },
  { name: 'Vaginal Implant Transmitter', description: '' },
  { name: 'Wing band', description: '' },
  { name: 'Scute Removal', description: '' },
  { name: 'Shell marking', description: '' },
  { name: 'Clipped', description: '' },
  { name: 'Dye or Paint', description: '' },
  { name: 'Fluorescence or radiation', description: '' },
  { name: 'Tag', description: '' },
  { name: 'Tattoo', description: '' },
  { name: 'Description in Comments', description: '' }
];

const FrequencyUnits = [
  { name: 'KHz', description: '' },
  { name: 'MHz', description: '' },
  { name: 'Hz', description: '' }
];

const LocationOfIdentifier = [
  { name: 'Right Ear', description: '' },
  { name: 'Right Front', description: '' },
  { name: 'Right Leg', description: '' },
  { name: 'Right Rear', description: '' },
  { name: 'Right Wing', description: '' },
  { name: 'Left Ear', description: '' },
  { name: 'Left Front', description: '' },
  { name: 'Left Leg', description: '' },
  { name: 'Left Rear', description: '' },
  { name: 'Left Wing', description: '' },
  { name: 'Neck', description: '' },
  { name: 'Front', description: '' },
  { name: 'Rear', description: '' },
  { name: 'Back', description: '' }
];

const Shape = [
  { name: 'Round', description: '' },
  { name: 'Triangular', description: '' },
  { name: 'Square', description: '' },
  { name: 'Rectangular', description: '' }
];

const Pattern = [
  { name: 'Horizontal Stripes', description: '' },
  { name: 'Vertical Stripes', description: '' },
  { name: 'Diagonal Stripes', description: '' }
];

const Color = [
  { name: 'Green', description: '' },
  { name: 'Blue', description: '' },
  { name: 'Black', description: '' },
  { name: 'Brown', description: '' },
  { name: 'Yellow', description: '' },
  { name: 'Orange', description: '' },
  { name: 'Red', description: '' },
  { name: 'White', description: '' },
  { name: 'Pink', description: '' },
  { name: 'Purple', description: '' }
];

const SpeciesOccurrenceStatus = [
  { name: 'Present', description: '' },
  { name: 'Absent', description: '' }
];

const ActivityIncidentalObservation = [
  { name: 'Alert' },
  { name: 'Avoiding Pests' },
  { name: 'Basking' },
  { name: 'Bedding' },
  { name: 'Building' },
  { name: 'Cashing' },
  { name: 'Casting' },
  { name: 'Courting' },
  { name: 'Denning' },
  { name: 'Disturbed' },
  { name: 'Drinking' },
  { name: 'Excreting' },
  { name: 'Feeding' },
  { name: 'Fleeing' },
  { name: 'Feeding salmonid' },
  { name: 'Grooming' },
  { name: 'Habitat' },
  { name: 'Hibernating' },
  { name: 'Hunting' },
  { name: 'Ingesting Minerals' },
  { name: 'Incubating' },
  { name: 'Living' },
  { name: 'Migrating Daily' },
  { name: 'Migrating Seasonally' },
  { name: 'Reproducing birthing' },
  { name: 'Reproducing eggs' },
  { name: 'Rearing' },
  { name: 'Standing' },
  { name: 'Security' },
  { name: 'Security and/or Thermal' },
  { name: 'Thermal' },
  { name: 'Territoriality' },
  { name: 'Traveling, Flying' },
  { name: 'Traveling, Unclassified' },
  { name: 'Traveling, Walking' },
  { name: 'Traveling on a Path' },
  { name: 'Traveling, Running' },
  { name: 'Traveling, Swimming' },
  { name: 'Traveling, Heli-Skiing' },
  { name: 'Traveling, Skiing' },
  { name: 'Traveling, Snowmobiling' },
  { name: 'Traveling, Snowshoeing' },
  { name: 'Traveling, Snow Cat' },
  { name: 'Urinating' },
  { name: 'Described in comments' }
];

const FeatureType = [
  { name: 'Breeding Site' },
  { name: 'Maternity Roost' },
  { name: 'Bat Nursery Roost' },
  { name: 'Rookery' },
  { name: 'Courting Site' },
  { name: 'Feeding Site' },
  { name: 'Resting Site' },
  { name: 'Staging Site' },
  { name: 'Ungulate Winter Range' },
  { name: 'Hibernaculum' },
  { name: 'Roost' },
  { name: 'Wallow' },
  { name: 'Mineral Lick' },
  { name: 'Burrow' },
  { name: 'Den' },
  { name: 'Lodge' },
  { name: 'Nest' },
  { name: 'Nest Tree' },
  { name: 'Plant Community' },
  { name: 'Plant Site' },
  { name: 'Hot Spring' },
  { name: 'Water' },
  { name: 'Fisheries Sensitive Feature' },
  { name: 'Marine Sensitive Feature' },
  { name: 'Described in Comments' }
];

const SignType = [
  { name: 'Antler' },
  { name: 'Body Parts' },
  { name: 'Cache' },
  { name: 'Carcass' },
  { name: 'Egg Shell' },
  { name: 'Excrement' },
  { name: 'Feeding' },
  { name: 'Feather' },
  { name: 'Hair' },
  { name: 'Pellet Group' },
  { name: 'Scratchings' },
  { name: 'Regurgitated Pellet' },
  { name: 'Shed Skin' },
  { name: 'Trail' },
  { name: 'Tracks' },
  { name: 'Whitewash' },
  { name: 'Described in Comments' }
];

const SignAge = [{ name: 'Fresh' }, { name: 'Old' }];

const Habitat = [
  { name: 'Alpine' },
  { name: 'Alpine Barren' },
  { name: 'Alpine Heath Meadows' },
  { name: 'Avalanche Path' },
  { name: 'Broken Cliffs' },
  { name: 'Broken Cliff in Timber' },
  { name: 'Burn' },
  { name: 'Caves' },
  { name: 'Clearcut' },
  { name: 'Cliff' },
  { name: 'Cliff - open' },
  { name: 'Cliff in Forest' },
  { name: 'Coniferous' },
  { name: 'Deciduous' },
  { name: 'Dissected Cliffs' },
  { name: 'Flat or Open Slopes' },
  { name: 'Glacier' },
  { name: 'Grass' },
  { name: 'Krummholtz' },
  { name: 'Mixed Wood' },
  { name: 'Moraine' },
  { name: 'Ridge' },
  { name: 'Riparian' },
  { name: 'Rock/Talus' },
  { name: 'Scree' },
  { name: 'Shrub' },
  { name: 'Snow' },
  { name: 'Sub-Alpine' },
  { name: 'Talus/Slope' },
  { name: 'Terraces' },
  { name: 'Timber' },
  { name: 'Wetland/Meadow' },
  { name: 'Willow/Shrub' }
];

const HabitatSlope = [
  { name: 'Flat (0%)', description: 'Flat (0%)' },
  { name: 'Minimum (5-20%)', description: 'Minimum (5-20%)' },
  { name: 'Moderate (20-50%)', description: 'Moderate (20-50%)' },
  { name: 'Steep (>50%)', description: 'Steep (>50%)' }
];

const SheepSpecies = [
  { name: 'Bighorn Sheep' },
  { name: 'Ovis canadensis' },
  { name: 'M-OVCA' },
  { name: "Dall''s Sheep" },
  { name: 'M-OVDA-DA' },
  { name: "Stone''s Sheep" },
  { name: 'M-OVDA-ST' },
  { name: 'Thinhorn Sheep' },
  { name: 'Ovis dalli' },
  { name: 'M-OVDA' }
];

const MooseSpecies = [
  { name: 'Moose' },
  { name: 'Alces Alces' },
  { name: 'Alces Americanus' },
  { name: 'M-ALAL' },
  { name: 'M-ALAM' },
  { name: 'Caribou' },
  { name: 'Elk' }
];

const ParameterStatistic = [
  { name: 'Population', description: '' },
  { name: 'Individuals', description: '' },
  { name: 'Adults', description: '' },
  { name: 'Calves', description: '' },
  { name: 'Bulls', description: '' },
  { name: 'Sub-Prime Bulls', description: '' },
  { name: 'Prime Bulls', description: '' },
  { name: 'Senior Bulls', description: '' },
  { name: 'RISC Class I Bulls', description: '' },
  { name: 'RISC Class II Bulls', description: '' },
  { name: 'RISC Class III Bulls', description: '' },
  { name: 'Oswald (1997) Class I Bulls', description: '' },
  { name: 'Oswald (1997) Class II Bulls', description: '' },
  { name: 'Oswald (1997) Class III Bulls', description: '' },
  { name: 'Adult Bulls', description: '' },
  { name: 'Yearlings Bulls', description: '' },
  { name: 'Cows', description: '' },
  { name: 'Unclassified Age and Sex', description: '' },
  { name: 'Calf:100 Adult Ratio', description: '' },
  { name: 'Cow:100 Bull Ratio', description: '' },
  { name: 'Calf:100 Cow Ratio', description: '' },
  { name: 'Percent Calves', description: '' },
  { name: 'Survival Adult', description: '' },
  { name: 'Survival Cows', description: '' },
  { name: 'Survival Bulls', description: '' },
  { name: 'Survival Calves', description: '' },
  { name: 'Survival Yearling', description: '' },
  { name: 'Mortality Adults', description: '' },
  { name: 'Mortality Bulls', description: '' },
  { name: 'Mortality Cows', description: '' },
  { name: 'Mortality Calves', description: '' },
  { name: 'Mortality Yearlings', description: '' },
  { name: 'Individuals/km2', description: '' },
  { name: 'Individuals/m2', description: '' },
  { name: 'Detections', description: '' },
  { name: 'Detections/km', description: '' },
  { name: 'Detections/100 m', description: '' },
  { name: 'Detections/hour', description: '' },
  { name: 'Detections/day', description: '' },
  { name: 'Detections/100 days', description: '' }
];

const SightabilityModel = [
  {
    name: 'Model or Correction - Sightability Correct Factor',
    description: `The parameter value is based on the sampled value but is adjusted via a sightability correction factor and/or detectability correction factor.`
  },
  {
    name: 'Model or Correction - Joint Hypergeometric Estimator',
    description: `The parameter value is based on the sampled value (i.e. based on the observations or detections) but is adjusted via the Joint Hypergeometric Estimator. The adjusted value represents an estimate of the true parameter value for the Study Area or Design Component of interest.`
  },
  {
    name: 'Model or Correction - Lincoln-Peterson',
    description: `The parameter value is based on the sampled value (i.e. based on the observations or detections) but is adjusted via Lincoln-Peterson formula. The adjusted value represents an estimate of the true parameter value for the Study Area or Design Component of interest.`
  },
  {
    name: 'Model or Correction - MoosePop - Kamloops',
    description: `The parameter value is based on the sampled value (i.e. based on the observations or detections) but is adjusted via the MoosePop model, and Prince George sight. model. The adjusted value represents an estimate of the true parameter value for the Study Area or Design Component of interest.`
  },
  {
    name: 'Model or Correction - MoosePop - Prince George',
    description: `The parameter value is based on the sampled value (i.e. based on the observations or detections) but is adjusted via the MoosePop model, and Kamloops sight. model. The adjusted value represents an estimate of the true parameter value for the Study Area or Design Component of interest.`
  },
  {
    name: 'Model or Correction - Recruitment-Mortality',
    description: `The parameter value is based on the sampled value (i.e. based on the observations or detections) but is adjusted using the recruitment-mortality equation. The adjusted value represents an estimate of the true parameter value for the study area or design component of interest.`
  },
  {
    name: 'Model or Correction & Expert Knowledge',
    description: `The parameter value is based on the modelled or corrected  value but is adjusted via expert knowledge. The adjusted value represents an estimate of the true parameter value for the study area or design component of interest.`
  },
  {
    name: 'Minimum Number Known Alive',
    description: `"The value is based on the sampled value but is adjusted using additional information other than a model or SCF. The adjusted value represents the minimum number of individuals known to be alive in the area of interest.
  Examples of situations in which MNKA may be used are:
  (1) observed count is adjusted based on pre- or post-survey information.
  (2) a Survey uses telemetry to locate additional collared individuals outside of the defined study area."`
  },
  {
    name: 'Peak Count',
    description: `The maximum number of individuals counted during the survey period. Usually used for deer spotlight counts, or carry-over counts.`
  },
  { name: 'None', description: `No sightability model/correction factor was applied.` },
  {
    name: 'Describe in Comments',
    description: `The parameter method is described in comments. Note: Describing the data in comments rather than using a predefined code may reduce the clarity and accessibility of data.`
  }
];

const BestParameterFlag = [
  { name: 'Yes', description: '' },
  { name: 'No', description: '' },
  { name: 'Unknown', description: '' },
  { name: 'Not Evaluated', description: '' }
];

const GoatSpecies = [{ name: 'Mountain Goat' }, { name: 'Oreamnos americanus' }, { name: 'M-ORAM' }, { name: 'ORAM' }];
interface objectNameDescription {
  name: string;
  description?: string;
}

export function basicNumericValidator() {
  return [
    {
      column_numeric_validator: {
        name: '',
        description: ''
      }
    }
  ];
}

export function basicCodeValidator(codeValues: objectNameDescription[]) {
  return [
    {
      column_code_validator: {
        name: '',
        description: '',
        allowed_code_values: codeValues
      }
    }
  ];
}

export const defaultPicklist = {
  yN: yN,
  aircraftType: AircraftType,
  light: Light,
  uTMZone: UTMZone,
  gPSDatum: GPSDatum,
  latLongUnits: LatLongUnits,
  activityObservation: ActivityObservation,
  searchType: SearchType,
  targetType: TargetType,
  markType: MarkType,
  frequencyUnits: FrequencyUnits,
  locationOfIdentifier: LocationOfIdentifier,
  shape: Shape,
  pattern: Pattern,
  color: Color,
  speciesOccurrenceStatus: SpeciesOccurrenceStatus,
  activityIncidentalObservation: ActivityIncidentalObservation,
  featureType: FeatureType,
  signType: SignType,
  signAge: SignAge,
  habitat: Habitat,
  habitatSlope: HabitatSlope
};

export const summaryPickList = {
  parameter: ParameterStatistic,
  sightabilityModel: SightabilityModel,
  bestParameterValueFlag: BestParameterFlag
};

export const SheepItems = {
  ...defaultPicklist,
  species: SheepSpecies
};

export const GoatItems = {
  ...defaultPicklist,
  species: GoatSpecies
};

export const MooseItems = {
  ...defaultPicklist,
  species: MooseSpecies
};

export const MooseSummaryItems = {
  ...summaryPickList
};

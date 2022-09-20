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
  { name: 'Moving' },
  { name: 'Not Moving' }
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

const AgeOfSign = [{ name: 'Fresh' }, { name: 'Old' }];

const Topography = [{ name: 'Flat' }, { name: 'Slope' }, { name: 'Steep' }];

const SheepSpecies = [
  { name: 'Bighorn Sheep' },
  { name: 'Ovis canadensis' },
  { name: 'M-OVCA' },
  { name: "Dall's Sheep" },
  { name: 'M-OVDA-DA' },
  { name: "Stone's Sheep" },
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
  { name: 'M-ALAM' }
];

const ElkSpecies = [{ name: 'Elk' }, { name: 'Rocky Mountain Elk' }, { name: 'Roosevelt Elk' }];
const ElkHabitat = [
  { name: 'Agricultural' },
  { name: 'Clearcut Herbaceous' },
  { name: 'Cultivated Field' },
  { name: 'Coniferous' },
  { name: 'Cutblock - Free to Grow' },
  { name: 'Cutblock - Matrue' },
  { name: 'Cutblock - Not Sufficiently Restored' },
  { name: 'Deciduous' },
  { name: 'Estuary' },
  { name: 'Grassland' },
  { name: 'Mature Forest' },
  { name: 'Mixed' },
  { name: 'Riparian Forest' },
  { name: 'River' },
  { name: 'Young Forest' }
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
  ageOfSign: AgeOfSign,
  topography: Topography
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

export const ElkItems = {
  ...defaultPicklist,
  species: ElkSpecies,
  habitat: ElkHabitat
};

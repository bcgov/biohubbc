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

const YNcodes = [
  { name: 'Y', description: 'Yes' },
  { name: 'N', description: 'No' }
];

const YNDcodes = [
  { name: 'Y', description: 'Yes' },
  { name: 'N', description: 'No' },
  { name: "Didn''t Listen", description: "Didn''t Listen" }
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
  { name: 'M-ALAM' }
];

const GoatSpecies = [{ name: 'Mountain Goat' }, { name: 'Oreamnos americanus' }, { name: 'M-ORAM' }, { name: 'ORAM' }];

const SheepSignType = [
  { name: 'Bed' },
  { name: 'Body Parts' },
  { name: 'Carcass' },
  { name: 'Described in Comments' },
  { name: 'Feeding' },
  { name: 'Hair' },
  { name: 'Pellet Group' },
  { name: 'Trail' },
  { name: 'Tracks' }
];

const MooseSignType = [
  { name: 'Antler' },
  { name: 'Body Parts' },
  { name: 'Cache' },
  { name: 'Carcass' },
  { name: 'Described in Comments' },
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
  { name: 'Whitewash' }
];

const DefaultSignType = [
  { name: 'Antler' },
  { name: 'Body Parts' },
  { name: 'Cache' },
  { name: 'Carcass' },
  { name: 'Described in Comments' },
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
  { name: 'Whitewash' }
];

const GoatSignType = [
  { name: 'Bed' },
  { name: 'Body Parts' },
  { name: 'Carcass' },
  { name: 'Described in Comments' },
  { name: 'Feeding' },
  { name: 'Hair' },
  { name: 'Pellet Group' },
  { name: 'Trail' },
  { name: 'Tracks' }
];

const ActivityObservation = [
  { name: 'Bedding' },
  { name: 'Standing' },
  { name: 'Running' },
  { name: 'Walking' },
  { name: 'Moving' }
];

const Habitat = [
  { name: 'Alpine' },
  { name: 'Alpine Barren' },
  { name: 'Alpine Heath Meadows' },
  { name: 'Avalanche Path' },
  { name: 'Broken Cliffs' },
  { name: 'Broken Cliffs in Timber' },
  { name: 'Burn' },
  { name: 'Caves' },
  { name: 'Clearout' },
  { name: 'Cliff' },
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
  { name: 'Moderate (20-50%', description: 'Moderate (20-50%' },
  { name: 'Steep (>50%)', description: 'Steep (>50%)' }
];

const ActivityNonTarget = [
  { name: 'Alert' },
  { name: 'Avoiding Pests' },
  { name: 'Basking' },
  { name: 'Bedding' },
  { name: 'Building' },
  { name: 'Caching' },
  { name: 'Casting' },
  { name: 'Courting' },
  { name: 'Denning' },
  { name: 'Disturbed' },
  { name: 'Drinking' },
  { name: 'Excreting' },
  { name: 'Feeding' },
  { name: 'Fleeing' },
  { name: 'Feeding Salmonid' },
  { name: 'Grooming' },
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
  { name: 'Security, Habitat' },
  { name: 'Security and/or Thermal' },
  { name: 'Thermal, Habitat' },
  { name: 'Territoriality' },
  { name: 'Not Traveling' },
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

const Light = [
  { name: 'Bright', description: '' },
  { name: 'Flat', description: '' }
];

const SignAge = [
  { name: 'Fresh', description: 'Fresh' },
  { name: 'Old', description: 'Old' }
];

const GPSDatum = [{ name: 'NAD83' }, { name: 'NAD27' }, { name: 'WGS84' }];

export const basicNumericValidator = [
  {
    column_numeric_validator: {
      name: '',
      description: ''
    }
  }
];

export function basicCodeValidator(codeValues: object) {
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

export const SheepItems = {
  basicYN: YNcodes,
  basicYNDidnt: YNDcodes,
  basicLight: Light,
  basicSignAge: SignAge,
  basicSignType: DefaultSignType,
  aircraftType: AircraftType,
  activityObservation: ActivityObservation,
  habitat: Habitat,
  habitatSlope: HabitatSlope,
  activityNonTarget: ActivityNonTarget,
  featureType: FeatureType,
  gPSDatum: GPSDatum,
  species: SheepSpecies,
  speciesSignType: SheepSignType
};

export const GoatItems = {
  basicYN: YNcodes,
  basicYNDidnt: YNDcodes,
  basicLight: Light,
  basicSignAge: SignAge,
  basicSignType: DefaultSignType,
  aircraftType: AircraftType,
  activityObservation: ActivityObservation,
  habitat: Habitat,
  habitatSlope: HabitatSlope,
  activityNonTarget: ActivityNonTarget,
  featureType: FeatureType,
  gPSDatum: GPSDatum,
  species: GoatSpecies,
  speciesSignType: GoatSignType
};

export const MooseItems = {
  basicYN: YNcodes,
  basicYNDidnt: YNDcodes,
  basicLight: Light,
  basicSignAge: SignAge,
  basicSignType: DefaultSignType,
  aircraftType: AircraftType,
  activityObservation: ActivityObservation,
  habitat: Habitat,
  habitatSlope: HabitatSlope,
  activityNonTarget: ActivityNonTarget,
  featureType: FeatureType,
  gPSDatum: GPSDatum,
  species: MooseSpecies,
  speciesSignType: MooseSignType
};

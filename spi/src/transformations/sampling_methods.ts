import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSamplingMethods = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Methods');
  
    const sql = SQL`
-------------------------------------------------------------------------------------------------
--- Inserting into technique the survey ids from sampling sites, and a name -- 
-- sampling techniques are only created for surveys where sampling sites exist - since methods are dependent on sample sites ---

    WITH w_method_lookups AS (SELECT ml.method_lookup_id, s.survey_id, ml.name
            FROM 
                biohub.survey s
            JOIN 
                public.spi_surveys sp ON s.spi_survey_id = sp.survey_id
            JOIN 
                biohub.method_lookup ml ON 
                CASE 
                        WHEN sp.method_type_cd = 'OBS_MAWE_SNTR' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_TSAL_SEQS' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_SPMA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MSTC_DETC_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_GAME_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_CNFB_AERS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'ROOS_ELK_CLASS_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RIVB_TERL_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_ROST_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOCO_SITR_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MAMU_MAFT_2.0' THEN 'Radar'
                        WHEN sp.method_type_cd = 'OBS_MSTC_SNTR_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HAN_BIRD_CAPF_2.0' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'HAN_BIRD_CAPF_2.1' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'OBS_PSAL_CAPS_2.0' THEN 'Pitfall Trap'
                        WHEN sp.method_type_cd = 'OBS_PSAL_TRAN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BAPT_SRCA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HAN_WOCO_CAPF_2.0' THEN 'Placeholder Gun Net'
                        WHEN sp.method_type_cd = 'OBS_BAPT_LARV_2.0' THEN 'Handheld net'
                        WHEN sp.method_type_cd = 'OBS_BAPT_AUDI_2.0' THEN 'Placeholder Audio Encounter'
                        WHEN sp.method_type_cd = 'TELEMETRY_DATA' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_WATR_BRCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MAMU_MVFT' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WATR_PBCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_TOCO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SNAK_TRAN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SNAK_HACO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_OBS_BECO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BEAR_SIGN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_CNFB_NECO_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_PISC_FWTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MSTC_SNTR' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOOD_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_CPLB' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_SABL' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BAPT_TETR_2.0' THEN 'Pitfall Trap'
                        WHEN sp.method_type_cd = 'OBS_PSAL_TCQS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SMAM_CAPS_2.1' THEN 'Box or live trap'
                        WHEN sp.method_type_cd = 'OBS_UNGG_SLCO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOOD_CPLB_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_TRAP' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'OBS_WATR_NBCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HERPETILE_GROUP_DATA_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_BAIT_SIGN' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_CLASS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_MNHT_2.1' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'Bird Call Playback' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_TFPG_HACO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_STWA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_EFWT_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_PECO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_COUNT' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_CLASS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SMAM_CAPS_2.0' THEN 'Box or live trap'
                        WHEN sp.method_type_cd = 'OBS_BATS_MNHT_2.0' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'BIRD_DETECTION_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.0' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_MAMU_FOSU_2.0' THEN 'Radar'
                        WHEN sp.method_type_cd = 'Wildlife Camera' THEN 'Camera trap'
                        WHEN sp.method_type_cd = 'OBS_BATS_DETC_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_OWL_NEST' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_RAP_NEST' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Bat Acoustic' THEN 'Placeholder Audio Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_PTCO_2.0' THEN 'Point Count'
                        WHEN sp.method_type_cd = 'Bird Nest Descriptions' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Herp Capture Or Handling Or Class Or Count' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.2' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_OWL_CLPB' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_CENS_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.1' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'HERPETILE_INDIVIDUAL_DATA_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Bird Nest Visits' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_CPLB_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_SABL_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_OBS_SGN' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Rare Plants and Fungi' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Ungulate Census' THEN 'Visual Encounter'
                        -- Visual Encounter
                        WHEN sp.method_type_cd IN (
                            '12-Administrative Miscellaneous',
                            'HERPETILE_HABITAT_DATA_1.0',
                            'Mortalities',
                            'OBS_BAPT_ROAD_2.0',
                            'OBS_BATS_DETC',
                            'HAN_MAMM_CAPF_2.2',
                            'HAN_WOCO_CAPF_2.2',
                            'Bird Capture Or Handling',
                            'OBS_REPT_CAPT_1.0',
                            'Snake Capture',
                            'ANIMAL_OBS_SIGN_1.0',
                            'Bat Capture Or Handling',
                            'OBS_BIRD_CAPT_1.0',
                            'Small Mammal Capture Or Handling',
                            'HAN_MAMM_CAPF_2.0',
                            'Tree Descriptions',
                            'HAN_MAMM_CAPF_2.1',
                            'Medium to Large Mammal Capture Or Handling',
                            'Cap and Hand - Med to Large',
                            'OBS_MAM_CAPT_1.0',
                            'Animal DNA Collecting',
                            'HISTORICAL_DATA',
                            'Animal Capture or Marking',
                            'Results by Area',
                            'Census',
                            'LBS') AND sp.survey_name IN (
                            '%Aerial and Ground Spring Lamb Survey%', 
                            '%Pellet Count and Aerial Survey%', 
                            '%Track Transects%', 
                            '%2001 - Robson Valley Grizzly Bear Survey%', 
                            '%2006 - Williamsons Sapsucker Call Playback and Nest Visit and Search%',
                            '%Aerial Composition Survey%',
                            '%1995 -2005 Williamsons Sapsucker Call Playback Surveys%',
                            '%Repeated Nest Site visits%',
                            '%Aerial Rut Survey%',
                            '%Toadfest Survey%',
                            '%1996 - Woodpecker Call Playbacks%',
                            '%Aerial SRB Survey%',
                            '%Aerial Transect%',
                            '%Roost Counts and Surveys%',
                            '%Aerial Survey%',
                            '%Whitebark Pine Surveys and Incidental Sightings%',
                            '%Nesting Habitat Survey%',
                            '%Aerial Block Transects%',
                            '%Aerial/ Boat Breeding Survey%',
                            '%Call Playback and Nest Searches%',
                            '%Nest productivity surveys%',
                            '%1976 Bighorn Sheep Aerial Census Northeast Coal%',
                            '%Road and Pond Surveys%',
                            '%Annual Roost Count%',
                            '%2009-Wetland Birds-Playback-PeaceFD%',
                            '%Spotlight Counts%',
                            '%Artificial Cover Object Survey%',
                            '%1996 -1997 - Cascade Mantled Ground Squirrel Survey%',
                            '%Cover Board Surveys%',
                            '%Forest Berry Production Surveys%',
                            '%Incidentals%',
                            '%Visual Inventory and Trapping%',
                            '%Visual Survey%',
                            '%Systematic Search%',
                            '%rock outcrop search%',
                            '%Breeding Territory Survey%',
                            '%Stand Survey%',
                            '%Wandering Transect%',
                            '%Aerial Late Winter Reconnaissance%',
                            '%1996 - Marten Track Abundance Survey%',
                            '%Aerial Flight%',
                            '%Nest observations%',
                            '%2010 -ongoing - Animal Observations by Ski Operators%',
                            '%Aerial Transect Survey%',
                            '%Transects%',
                            '%Grassland Plant survey%',
                            '%Standwatch Survey%',
                            '%1996 - Pine Marten Winter Track Survey%',
                            '%Cougar Snow Tracking%',
                            '%Aerial census%',
                            '%Aerial Census%',
                            '%Call Play Back survey%',
                            '%General Survey and Incidental Observations%',
                            '%Visual Encounter Survey%',
                            '%Amphibian Visual Eggmass Survey%',
                            '%Aerial Survey Transect%',
                            '%Winter snow track surveys%',
                            '%Stand and Nest Survey%',
                            '%1989 Mountain Goat Aerial Survey Bullmoose Mtn.%',
                            '%Waterbird Survey%',
                            '%Aerial and Ground Survey%',
                            '%Aerial/Ground Survey and Ecology Study%',
                            '%Visual and Scat Observation%',
                            '%Pond-breeding Amphibian Survey%',
                            '%Spot Light Count%',
                            '%Den Observations%',
                            '%1994 Mountain goat Aerial Census Bullmoose Mtn.%',
                            '%Flammulated Owl Survey%',
                            '%Stand Watch Surveys%',
                            '%Road Mortality%',
                            '%Spring Road Transect Surveys%',
                            '%nest visit%',
                            '%Ground Based Survey%',
                            '%Aerial%',
                            '%Transect Survey%',
                            '%Small Mammal Trapping%',
                            '%Snow-Track Survey%',
                            '%Road Transect Survey%',
                            '%Point Count Survey%',
                            '%Stream Surveys%',
                            '%Nesting Locations%',
                            '%1996-99 - Mountain Goat Stand Watch%',
                            '%breeding bird survey%',
                            '%Transplant Monitoring%',
                            '%Track transect%',
                            '%1996 Amphibian Visual Encounter Survey%',
                            '%Ungulate Surveys%',
                            '%Spring Nest Monitoring%',
                            '%1997 - Winter Track Surveys%',
                            '%Late Winter Reconnaissance Flights%',
                            '%Aerial Survey Summary%',
                            '%Nest Observations%',
                            '%Ground and Aerial Track Counts%',
                            '%owl Observations%',
                            '%Visual Den Search%',
                            '%Aerial classification%',
                            '%Helicopter Survey%',
                            '%Sticknest Surveys%',
                            '%Reconnaisance%',
                            '%Elk Conflicts%',
                            '%Migrating Bird%',
                            '%Post Metamorph Juvenile Counts%',
                            '%Detection Surveys, Egg counts, Dye tracking, Radio-telemetry%',
                            '%Stratified Stand Survey%',
                            '%Winter Aerial Survey%',
                            '%Aerial Summer Population Count & Composition%',
                            '%1987 Mule Deer Aerial Census Two Rivers%',
                            '%Road Counts%',
                            '%Aerial Summer Migratory Survey%',
                            '%Visual Egg Inventory%',
                            '%Caribou Lichen Availability%',
                            '%Aerial Stick Nest Survey%',
                            '%Inventory and Nesting Habitat%',
                            '%Northern Goshawk Call Playback%',
                            '%Burrow Survey%',
                            '%Egg Mass Surveys%',
                            '%Breeding Bird Surveys%',
                            '%March 2010 Caribou survey Columbia mountains%',
                            '%Aerial Track Survey%',
                            '%Sticknest Survey%',
                            '%Moose- Aerial Census%',
                            '%Ungulate Survey%',
                            '%Ground Search%',
                            '%Den Monitoring%',
                            '%Breeding Site Survey%',
                            '%visual survey%',
                            '%Egg Mass Collection%',
                            '%Roadside Point Count%',
                            '%Aerial Track Counts%',
                            '%Planting Survey%',
                            '%General Nest Survey%',
                            '%Nest Searches%',
                            '%Ground and Aerial Survey%',
                            '%Egg mass survey%',
                            '%Aerial survey%',
                            '%Visual Envounter Surveys%',
                            '%Point Count Observations%',
                            '%Spring Spotlight Counts%',
                            '%Volunteer Road Transect Survey%',
                            '%Aerial Late Winter Survey%',
                            '%Transect and Aerial Surveys and Incidentals%',
                            '%2007 Kinaskan sheep/goat aerial survey%',
                            '%standwatch%',
                            '%Transect and Trapping Survey%',
                            '%Aerial Winter Reconnaissance%',
                            '%Aerial Total Count%',
                            '%1997 - Track Transect Survey%',
                            '%Salvage Sweep%',
                            '%Aerial Occurrence Survey%',
                            '%Artificial Cover Object Surveys%',
                            '%Snow tracking transect%',
                            '%Transect Visual Encounter Surveys%',
                            '%Nest Survey%',
                            '%Visbility Trials%',
                            '%Ground Survey%',
                            '%Vascular Plants%',
                            '%Reconnaissance Survey%',
                            '%2008 warbler breeding bird survey%',
                            '%Road Transects%',
                            '%Monitoring Survey%',
                            '%Pellet Counts%',
                            '%Stand Watch and Nest Search%',
                            '%General Survey Road Transect%',
                            '%1992-Bison-Aerial Survey-Sikanni Chief River%',
                            '%Aerial Presence Not Detected Survey%',
                            '%2009-Grand Coulee owl-monitoring-South Okanagan%',
                            '%aerial census%',
                            '%Nest Visit%',
                            '%Ground Counts%',
                            '%Pair and Brood Surveys%',
                            '%Forest berry productivity%',
                            '%Berry Production Survey%',
                            '%Nest Search%',
                            '%1988 Mule Deer Aerial Census Block D9%',
                            '%1988 Mule Deer Aerial Census Block D4%',
                            '%Track/Pellet Transect%',
                            '%Nest Monitoring and Searches%',
                            '%Walking transect survey%',
                            '%Composition Surveys%',
                            '%Burrow Inventory%',
                            '%UWR Occupancy Surveys%',
                            '%Aerial and Ground Census%',
                            '%Forest berry productivity survey%',
                            '%Aerial & Ground Surveys%',
                            '%1997 - Badger Historical Data Collection%',
                            '%Annual Bat Watch%',
                            '%Visual Surveys%',
                            '%Aerial Observations%',
                            '%1988 Mule Deer Aerial Census Block D1%',
                            '%Visual Search%',
                            '%2009-Deer-snow tracking-tfl49%',
                            '%Nesting Inventory%',
                            '%Winter Tracking%',
                            '%tailed Deer Winter Track%',
                            '%1996 - Woodpecker Sign%',
                            '%WNS and Pd Surveillance%',
                            '%Hibernacia Ground Search%',
                            '%1996 -1997 - Blue Grouse Survey%',
                            '%Aerial Recce%',
                            '%1990 Mountain Goat Aerial Census Bullmoose Mtn.%',
                            '%TrackTransect%',
                            '%Nest Monitoring and Searches%',
                            '%Walking transect survey%',
                            '%Composition Surveys%',
                            '%Burrow Inventory%',
                            '%Aerial and Ground Census%',
                            '%2010- mountain goat- aerial - mid-Iskut River%',
                            '%Point Count Observations%',
                            '%Spring Spotlight Counts%',
                            '%Aerial Sticknest Survey%',
                            '%Aerial Observations%') THEN 'Visual Encounter'
                            -- Radio
                        WHEN sp.method_type_cd IN (
                            '12-Administrative Miscellaneous',
                            'HERPETILE_HABITAT_DATA_1.0',
                            'Mortalities',
                            'OBS_BAPT_ROAD_2.0',
                            'OBS_BATS_DETC',
                            'HAN_MAMM_CAPF_2.2',
                            'HAN_WOCO_CAPF_2.2',
                            'Bird Capture Or Handling',
                            'OBS_REPT_CAPT_1.0',
                            'Snake Capture',
                            'ANIMAL_OBS_SIGN_1.0',
                            'Bat Capture Or Handling',
                            'OBS_BIRD_CAPT_1.0',
                            'Small Mammal Capture Or Handling',
                            'HAN_MAMM_CAPF_2.0',
                            'Tree Descriptions',
                            'HAN_MAMM_CAPF_2.1',
                            'Medium to Large Mammal Capture Or Handling',
                            'Cap and Hand - Med to Large',
                            'OBS_MAM_CAPT_1.0',
                            'Animal DNA Collecting',
                            'HISTORICAL_DATA',
                            'Animal Capture or Marking',
                            'Results by Area',
                            'Census',
                            'LBS') AND sp.survey_name IN (
                            '%1997 - Cougar Capture and Telemetry%', 
                            '%Telemetry%',
                            '%1996-2006 - Badger Capture and Radio Telemetry%',
                            '%1996-97 ELK Capture and Telemetry - MU 7 -50%',
                            '%1996-98 - Mountain Goat Capture and Telemetry%',
                            '%1997-98 Grizzly Bear Capture and Telemetry%',
                            '%1996-99 - Mountain Goat Telemetry%',
                            '%Oregon Spotted Frog-Bull Frog- Telemetry%',
                            '%Capture and Radio Telemetry%',
                            '%Telemetry Survey%',
                            '%Collaring and Telemetry%',
                            '%1998 - Moose Radio Telemetry Survey%',
                            '%1996-99 - Mountain Goat Site Survey%',
                            '%1998 -2002 - Elk Capture and Telemetry%',
                            '%1996 -1998 - Caribou Capture and Radio Telemetry%',
                            '%1997 - VI Goshawk Capture and Telemetry%',
                            '%2003 - Mountain Goat GPS Collars and Aerial Surveys%') THEN 'Radio'
                                -- Box or live trap
                        WHEN sp.method_type_cd IN (
                            '12-Administrative Miscellaneous',
                            'HERPETILE_HABITAT_DATA_1.0',
                            'Mortalities',
                            'OBS_BAPT_ROAD_2.0',
                            'OBS_BATS_DETC',
                            'HAN_MAMM_CAPF_2.2',
                            'HAN_WOCO_CAPF_2.2',
                            'Bird Capture Or Handling',
                            'OBS_REPT_CAPT_1.0',
                            'Snake Capture',
                            'ANIMAL_OBS_SIGN_1.0',
                            'Bat Capture Or Handling',
                            'OBS_BIRD_CAPT_1.0',
                            'Small Mammal Capture Or Handling',
                            'HAN_MAMM_CAPF_2.0',
                            'Tree Descriptions',
                            'HAN_MAMM_CAPF_2.1',
                            'Medium to Large Mammal Capture Or Handling',
                            'Cap and Hand - Med to Large',
                            'OBS_MAM_CAPT_1.0',
                            'Animal DNA Collecting',
                            'HISTORICAL_DATA',
                            'Animal Capture or Marking',
                            'Results by Area',
                            'Census',
                            'LBS') AND sp.survey_name IN (
                            '%Trapping%', 
                            '%Capture and Aerial Telemetry%',
                            '%Live Trapping%',
                            '%Live-capture%',
                            '%2009-Keens mouse-Trapping-Kitimat%',
                            '%2004 Mountain goat capture and monitoring%',
                            '%Mark Recapture%',
                            '%1999 -2000 Snake Capture and Radio Telemetry%',
                            '%1997-98 Grizzly Bear Capture and Telemetry%',
                            '%Capture and Monitoring%',
                            '%2009-Northern Goshawk-Nest Monitoring-Skeena%',
                            '%Mark Recapture and Visual Survey%',
                            '%2009-Deer-snow tracking-tfl49%',
                            '%Capture and Geolocator%',
                            '%Pesticide Research-Capture%',
                            '%Capture Survey%',
                            '%General, Mark Recapture and Road Surveys%',
                            '%DNA Mark-Recapture%',
                            '%1997 - VI Goshawk Capture and Telemetry%',
                            '%Capture and transport%') THEN 'Box or live trap'
                            -- Mist Net--
                        WHEN sp.method_type_cd IN (
                            '12-Administrative Miscellaneous',
                            'HERPETILE_HABITAT_DATA_1.0',
                            'Mortalities',
                            'OBS_BAPT_ROAD_2.0',
                            'OBS_BATS_DETC',
                            'HAN_MAMM_CAPF_2.2',
                            'HAN_WOCO_CAPF_2.2',
                            'Bird Capture Or Handling',
                            'OBS_REPT_CAPT_1.0',
                            'Snake Capture',
                            'ANIMAL_OBS_SIGN_1.0',
                            'Bat Capture Or Handling',
                            'OBS_BIRD_CAPT_1.0',
                            'Small Mammal Capture Or Handling',
                            'HAN_MAMM_CAPF_2.0',
                            'Tree Descriptions',
                            'HAN_MAMM_CAPF_2.1',
                            'Medium to Large Mammal Capture Or Handling',
                            'Cap and Hand - Med to Large',
                            'OBS_MAM_CAPT_1.0',
                            'Animal DNA Collecting',
                            'HISTORICAL_DATA',
                            'Animal Capture or Marking',
                            'Results by Area',
                            'Census',
                            'LBS') AND sp.survey_name IN (
                            '%Mugaha Marsh Banding Station%',
                            '%Call Play Back Capture and Banding%',
                            '%Mist netting%',
                            '%2009-Wetland Birds-Playback-PeaceFD%',
                            '%Banding and Nest Monitoring%',
                            '%Mist Net Capture%',
                            '%Monitoring and Banding%',
                            '%Banding%',
                            '%1996 - QCI Goshawk Capture and Telemetry%',
                            '%Mist-netting%') THEN 'Mist Net' 
                            -- Pitfall trap
                        WHEN sp.method_type_cd IN (
                            '12-Administrative Miscellaneous',
                            'HERPETILE_HABITAT_DATA_1.0',
                            'Mortalities',
                            'OBS_BAPT_ROAD_2.0',
                            'OBS_BATS_DETC',
                            'HAN_MAMM_CAPF_2.2',
                            'HAN_WOCO_CAPF_2.2',
                            'Bird Capture Or Handling',
                            'OBS_REPT_CAPT_1.0',
                            'Snake Capture',
                            'ANIMAL_OBS_SIGN_1.0',
                            'Bat Capture Or Handling',
                            'OBS_BIRD_CAPT_1.0',
                            'Small Mammal Capture Or Handling',
                            'HAN_MAMM_CAPF_2.0',
                            'Tree Descriptions',
                            'HAN_MAMM_CAPF_2.1',
                            'Medium to Large Mammal Capture Or Handling',
                            'Cap and Hand - Med to Large',
                            'OBS_MAM_CAPT_1.0',
                            'Animal DNA Collecting',
                            'HISTORICAL_DATA',
                            'Animal Capture or Marking',
                            'Results by Area',
                            'Census',
                            'LBS') AND sp.survey_name IN (
                            '%Riparian Pitfall Trapping%', 
                            '%Salvage Trapping%', 
                            '%Western Toad- General salvage%',
                            '%Amphibian Surveys%',
                            '%Drop trap%',
                            '%Salvage/Sweep%',
                            '%Coastal Tailed Frog Salvage%',
                            '%Amphibian and Reptile Salvage%',
                            '%1996 - Amphibian Surveys%',
                            '%Salvage%',
                            '%Spadefoot Toad Larval Inventory%') THEN 'Pitfall trap' 
                                -- Audio Encounter
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Auditory and Nest Search Surveys%', 
                                '%Spadefoot Toad Auditory Survey%', 
                                '%Call playback inventory%',
                                '%Call Playback%',
                                '%2006 Williamsons Sapsucker Call Playback%') THEN 'Audio Encounter'
                                -- Drone
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Unmanned Aerial Vehicle Survey%', 
                                '%Unmanned Aerial Vehicle Track Survey%', 
                                '%UAV Block Survey%') THEN 'Drone'
                                -- Electrofishing
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Electrofishing%',
                                '%TCS and Electrofishing%') THEN 'Electrofishing'
                                -- Camera Trap
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Aerial Survey and Cameras Traps%',
                                '%Photo survey%',
                                '%Remote Camera%',
                                '%Supplemental Feeding/Remote Camera%',
                                '%Telemetry and Wildlife Cameras%',
                                '%Remote Camera Survey%',
                                '%Camera Stations%',
                                '%General Survey Auditory%',
                                '%Remote Cameras and Hair Snag%',
                                '%Camera%',
                                '%Telemetry and Wildlife Cameras%') THEN 'Camera Trap'

                            -- Handheld net
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Tadpole Capture and Sampling%', 
                                '%Spadefoot Toad Larval Inventory%',
                                '%Dipnet%',
                                '%Amphibian Visual Encounter and Dipnet Survey%',
                                '%Sweep net%') THEN 'Handheld net' 
                                    -- Hair Snag
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Hair-snagging%', 
                                '%Hair Snare%',
                                '%Hair Snagging Sampling%',
                                '%Hair Snare DNA Survey%',
                                '%Hair Snare Census Grid%',
                                '%1996 -1998 - Kermode Bear Hair Snare Suveys%',
                                '%Hair Collection for Genetic Population Assignment%',
                                '%2000-ongoing - Grizzly Bear Detection and Identification%',
                                '%Hair Snag DNA Survey%') THEN 'Hair Snag'

                            -- Angling
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name LIKE '%Accoustic Lure%' THEN 'Angling'

                            -- Trap net
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%Funnel Trap Surveys%',
                                '%Minnow Trapping%',
                                '%Minnow Trap Surveys%',
                                '%Salvage Transects%') THEN 'Trap net'

                            -- Radar
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%SAR Surveys%',
                                '%Radar%',
                                '%Marmot%',
                                '%Radar Survey%') THEN 'Radar'

                            -- Gun net
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name LIKE '%Aerial Net Gunning and Collar Removal%' THEN 'Gun net'

                            -- Point count
                            WHEN sp.method_type_cd IN (
                                '12-Administrative Miscellaneous',
                                'HERPETILE_HABITAT_DATA_1.0',
                                'Mortalities',
                                'OBS_BAPT_ROAD_2.0',
                                'OBS_BATS_DETC',
                                'HAN_MAMM_CAPF_2.2',
                                'HAN_WOCO_CAPF_2.2',
                                'Bird Capture Or Handling',
                                'OBS_REPT_CAPT_1.0',
                                'Snake Capture',
                                'ANIMAL_OBS_SIGN_1.0',
                                'Bat Capture Or Handling',
                                'OBS_BIRD_CAPT_1.0',
                                'Small Mammal Capture Or Handling',
                                'HAN_MAMM_CAPF_2.0',
                                'Tree Descriptions',
                                'HAN_MAMM_CAPF_2.1',
                                'Medium to Large Mammal Capture Or Handling',
                                'Cap and Hand - Med to Large',
                                'OBS_MAM_CAPT_1.0',
                                'Animal DNA Collecting',
                                'HISTORICAL_DATA',
                                'Animal Capture or Marking',
                                'Results by Area',
                                'Census',
                                'LBS') AND sp.survey_name IN (
                                '%ARU/Point Count%', 
                                '%Point Count Survey%',
                                '%Point count%',
                                '%Point Count Inventory%',
                                '%Point Count Stations%',
                                '%Roadside Point Count%',
                                '%Point Count and Nest Surveys%',
                                '%Point Counts%') THEN 'Point count'
                        ELSE 'Undetermined'
                    END = ml.name;
            )
    INSERT INTO biohub.method_technique (survey_id, name, method_lookup_id, description)
    SELECT 
        sss.survey_id, 
        ml.name,
        method_lookup_id,
        'Came from SPI' AS description
    FROM 
        biohub.survey_sample_site sss
    LEFT JOIN w_method_lookups wml ON
        wml.survey_id = sss.survey_id;

----------------- INSERTING technique outputs INTO survey_sample_method where spi survey id is not null (ie only for spi migration surveys) ------
INSERT INTO biohub.survey_sample_method (survey_sample_site_id, method_technique_id)
SELECT 
    sss.survey_sample_site_id,
    mt.method_technique_id 
FROM 
    biohub.survey s
JOIN 
    biohub.survey_sample_site sss ON s.survey_id = sss.survey_id
JOIN 
    biohub.method_technique mt ON mt.survey_id = s.survey_id
WHERE 
    s.spi_survey_id IS NOT NULL;
    `;

  await connection.sql(transformSamplingMethods);
  await connection.sql(sql);

  console.log('Successfully transformed Sampling Methods');
};

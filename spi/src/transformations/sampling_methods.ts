import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSamplingMethods = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Sampling Methods');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    INSERT INTO placeholder_table (placeholder_column)
    SELECT
        CASE 
            WHEN method_type_cd = 'OBS_MAWE_SNTR' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_TSAL_SEQS' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SONG_SPMA_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_MSTC_DETC_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_GAME_ENTR_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_CNFB_AERS_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'ROOS_ELK_CLASS_1.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_RIVB_TERL_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BATS_ROST_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_WOCO_SITR_2.1' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_MAMU_MAFT_2.0' THEN 'Radar'
            WHEN method_type_cd = 'OBS_MSTC_SNTR_2.1' THEN 'Visual Encounter'
            WHEN method_type_cd = 'HAN_BIRD_CAPF_2.0' THEN 'Mist Net'
            WHEN method_type_cd = 'HAN_BIRD_CAPF_2.1' THEN 'Mist Net'
            WHEN method_type_cd = 'OBS_PSAL_CAPS_2.0' THEN 'Pitfall Trap'
            WHEN method_type_cd = 'OBS_PSAL_TRAN_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BAPT_SRCA_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'HAN_WOCO_CAPF_2.0' THEN 'Placeholder Gun Net'
            WHEN method_type_cd = 'OBS_BAPT_LARV_2.0' THEN 'Handheld net'
            WHEN method_type_cd = 'OBS_BAPT_AUDI_2.0' THEN 'Placeholder Audio Encounter'
            WHEN method_type_cd = 'TELEMETRY_DATA' THEN 'Placeholder Radio'
            WHEN method_type_cd = 'OBS_WATR_BRCO' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_MAMU_MVFT' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_WATR_PBCO' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGG_TOCO_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SNAK_TRAN_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SNAK_HACO_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'NON_STAN_OBS_BECO' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_RAPT_ENTR_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BEAR_SIGN_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_CNFB_NECO_2.1' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_PISC_FWTR_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_MSTC_SNTR' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_WOOD_ENTR_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_RAPT_CPLB' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGA_SABL' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BAPT_TETR_2.0' THEN 'Pitfall Trap'
            WHEN method_type_cd = 'OBS_PSAL_TCQS_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SMAM_CAPS_2.1' THEN 'Box or live trap'
            WHEN method_type_cd = 'OBS_UNGG_SLCO_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_WOOD_CPLB_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BATS_TRAP' THEN 'Mist Net'
            WHEN method_type_cd = 'OBS_WATR_NBCO' THEN 'Visual Encounter'
            WHEN method_type_cd = 'HERPETILE_GROUP_DATA_1.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'NON_STAN_BAIT_SIGN' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGG_CLASS_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_BATS_MNHT_2.1' THEN 'Mist Net'
            WHEN method_type_cd = 'Bird Call Playback' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_TFPG_HACO_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_RAPT_STWA_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGA_EFWT_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SONG_ENTR_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGG_PECO_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'NON_STAN_COUNT' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGA_CLASS_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_SMAM_CAPS_2.0' THEN 'Box or live trap'
            WHEN method_type_cd = 'OBS_BATS_MNHT_2.0' THEN 'Mist Net'
            WHEN method_type_cd = 'BIRD_DETECTION_1.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_INIT_TEL_1.0' THEN 'Placeholder Radio'
            WHEN method_type_cd = 'OBS_MAMU_FOSU_2.0' THEN 'Radar'
            WHEN method_type_cd = 'Wildlife Camera' THEN 'Camera trap'
            WHEN method_type_cd = 'OBS_BATS_DETC_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_OWL_NEST' THEN 'Visual Encounter'
            WHEN method_type_cd = 'NON_STAN_RAP_NEST' THEN 'Visual Encounter'
            WHEN method_type_cd = 'Bat Acoustic' THEN 'Placeholder Audio Encounter'
            WHEN method_type_cd = 'OBS_SONG_PTCO_2.0' THEN 'Point Count'
            WHEN method_type_cd = 'Bird Nest Descriptions' THEN 'Visual Encounter'
            WHEN method_type_cd = 'Herp Capture Or Handling Or Class Or Count' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_INIT_TEL_1.2' THEN 'Placeholder Radio'
            WHEN method_type_cd = 'OBS_OWL_CLPB' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGA_CENS_1.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_INIT_TEL_1.1' THEN 'Placeholder Radio'
            WHEN method_type_cd = 'HERPETILE_INDIVIDUAL_DATA_1.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'Bird Nest Visits' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_RAPT_CPLB_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'OBS_UNGA_SABL_2.0' THEN 'Visual Encounter'
            WHEN method_type_cd = 'NON_STAN_OBS_SGN' THEN 'Visual Encounter'
            WHEN method_type_cd = 'Rare Plants and Fungi' THEN 'Visual Encounter'
            WHEN method_type_cd = 'Ungulate Census' THEN 'Visual Encounter'
        END AS placeholder_column_value
    FROM 
        public.spi_surveys;
    `;

  await connection.sql(sql);

  console.log('Successfully transformed Sampling Methods');
};

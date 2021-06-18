-- indexes.sql

CREATE INDEX sec_token_idx
    ON security USING btree
    (security_token ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX sec_table_secr_id_idx
    ON security USING btree
    (secr_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX sec_table_su_id_idx
    ON security USING btree
    (su_id ASC NULLS LAST)
    TABLESPACE pg_default;

cp ..\merge.sql merge_unadjusted.sql
del ..\merge.sql
sed -e 's/record_end_date)/(record_end_date is NULL)) where record_end_date is null/g' merge_unadjusted.sql >> merge.sql
cp merge.sql ..
del merge_unadjusted.sql
del merge.sql
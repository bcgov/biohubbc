{{/* Output S3 credential lines for one repo (index 0 = repo1, 1 = repo2, ...). */}}
{{- define "postgres.s3" }}
{{- if .s3 }}
  {{- if .s3.key }}
repo{{ add .index 1 }}-s3-key={{ .s3.key }}
  {{- end }}
  {{- if .s3.keySecret }}
repo{{ add .index 1 }}-s3-key-secret={{ .s3.keySecret }}
  {{- end }}
  {{- if .s3.keyType }}
repo{{ add .index 1 }}-s3-key-type={{ .s3.keyType }}
  {{- end }}
  {{- if .s3.encryptionPassphrase }}
repo{{ add .index 1 }}-cipher-pass={{ .s3.encryptionPassphrase }}
  {{- end }}
{{- end }}
{{- end }}

{{/* Full S3 config for all four repos (repo1-repo4). Pass root context (.). */}}
{{- define "postgres.s3.full" -}}
[global]
{{- $root := . }}
{{- range $i := until 4 }}
{{ include "postgres.s3" (dict "s3" $root.Values.pgBackRest.s3 "index" $i) }}
{{- end }}
{{- end }}
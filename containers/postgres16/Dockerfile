FROM registry.redhat.io/rhel9/postgresql-15

# ENV POSTGRES_VERSION=15
ENV POSTGIS_MAJOR 3
ENV POSTGIS_VERSION 3.2.7
ENV PGDATA /var/lib/pgsql/data

ENV TZ=America/Vancouver

ENV PORT=5432

ENV HOME=/var/lib/pgsql
ENV PGUSER=postgres

# RUN apt-get update \
#     && apt-cache showpkg postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
#     && apt-get install -y --no-install-recommends \
#     # ca-certificates: for accessing remote raster files;
#     #   fix: https://github.com/postgis/docker-postgis/issues/307
#     ca-certificates \
#     \
#     postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
#     postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
#     postgresql-$PG_MAJOR-pgrouting \
#     postgresql-$PG_MAJOR-pgrouting-scripts \
#     && rm -rf /var/lib/apt/lists/*

USER 0

RUN yum update -y
RUN yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
# RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/F-39-x86_64/pgdg-fedora-repo-latest.noarch.rpm
# RUN yum install -y http://ftp.postgresql.org/pub/repos/yum/15/redhat/rhel-9-x86_64/postgresql15-contrib-15.6-1PGDG.rhel9.x86_64.rpm
# RUN yum install -y http://ftp.postgresql.org/pub/repos/yum/15/redhat/rhel-9-x86_64/postgresql15-server-15.6-1PGDG.rhel9.x86_64.rpm
RUN yum install -y \
    # ca-certificates: for accessing remote raster files;
    #   fix: https://github.com/postgis/docker-postgis/issues/307
    ca-certificates \
    \
    postgis34_15 \
    postgresql15-client
# postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
# postgresql-$PG_MAJOR-pgrouting \
# postgresql-$PG_MAJOR-pgrouting-scripts
RUN yum clean all

# RUN yum -y update \
#     && yum info postgresql$PG_MAJOR-postgis-$POSTGIS_MAJOR \
#     && yum -y install \
#     # ca-certificates: for accessing remote raster files;
#     #   fix: https://github.com/postgis/docker-postgis/issues/307
#     ca-certificates \
#     \
#     postgresql$PG_MAJOR-postgis-$POSTGIS_MAJOR-$POSTGIS_VERSION \
#     postgresql$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
#     postgresql$PG_MAJOR-pgrouting \
#     postgresql$PG_MAJOR-pgrouting-scripts \
#     && yum clean all

# set time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Add the SQL commands
RUN echo "\
    -- Enable PostGIS (includes raster)\n\
    CREATE EXTENSION IF NOT EXISTS postgis CASCADE;\n\
    CREATE EXTENSION IF NOT EXISTS postgis_raster CASCADE;\n\
    \n\
    -- Enable Topology and Routing\n\
    CREATE EXTENSION IF NOT EXISTS postgis_topology CASCADE;\n\
    CREATE EXTENSION IF NOT EXISTS postgis_sfcgal CASCADE;\n\
    CREATE EXTENSION IF NOT EXISTS pgRouting CASCADE;\n\
    \n\
    -- Enable Helper functions\n\
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch CASCADE;\n\
    CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;\n\
    " > /docker-entrypoint-initdb.d/postgis.sql

USER 26

EXPOSE $PORT

CMD ["postgres"]
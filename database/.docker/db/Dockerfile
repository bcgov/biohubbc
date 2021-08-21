ARG POSTGRES_VERSION=12.5

FROM postgres:$POSTGRES_VERSION

# read env variables
ARG TZ=America/Vancouver
ARG POSTGIS_VERSION=3

ENV PORT=5432

# install postgis packages
RUN mkdir -p /opt/apps
RUN apt-get -qq update
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-postgis-$POSTGIS_VERSION
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-postgis-$POSTGIS_VERSION-scripts
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-pgrouting
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-pgrouting-scripts
RUN apt-get -qq install -y --no-install-recommends postgresql-server-dev-$PG_MAJOR
RUN apt-get -qq install -y --no-install-recommends pgbadger pg-activity wget unzip nano
RUN apt-get -qq purge -y --auto-remove postgresql-server-dev-$PG_MAJOR
RUN apt-get -qq autoremove -y
RUN apt-get -qq clean

# set time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy postgis init script to docker init directory
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./create_postgis.sql /docker-entrypoint-initdb.d/postgis.sql

EXPOSE $PORT

CMD ["postgres"]

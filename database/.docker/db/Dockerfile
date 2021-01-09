FROM postgres:12

# set variables
ENV POSTGISV 3
ENV TZ America/Vancouver
ENV PORT 5432

# install postgis packages
RUN mkdir -p /opt/apps
RUN apt-get -qq update
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-postgis-$POSTGISV
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-postgis-$POSTGISV-scripts
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-pgrouting
RUN apt-get -qq install -y --no-install-recommends postgresql-$PG_MAJOR-pgrouting-scripts
RUN apt-get -qq install -y --no-install-recommends postgresql-server-dev-$PG_MAJOR
RUN apt-get -qq purge -y --auto-remove postgresql-server-dev-$PG_MAJOR
RUN apt-get -qq clean

# set time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy postgis init script to docker init directory
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./create_postgis.sql /docker-entrypoint-initdb.d/postgis.sql

EXPOSE ${PORT}

CMD ["postgres"]

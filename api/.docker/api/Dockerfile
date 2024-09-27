# ########################################################################################################
# This DockerFile is used for local development (via compose.yml) only.
# ########################################################################################################

FROM node:20

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

WORKDIR $HOME

# Copy the package files only
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./

RUN npm ci --include=dev

ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

# Copy the rest of the files
COPY . ./

# Update log directory file permissions, prevents permission errors for linux environments
RUN mkdir -p data/logs && chmod -R a+rw data/logs

VOLUME ${HOME}

# start api with live reload
CMD ["npm", "run", "start-reload"]

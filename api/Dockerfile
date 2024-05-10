# ########################################################################################################
# This DockerFile is used for Openshift deployments only.
# ########################################################################################################

FROM node:18

USER 0

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

RUN chgrp -R 0 $HOME && \
    chmod -R g+rwX $HOME

WORKDIR $HOME

# Copy the package files only
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

ENV PATH ${HOME}/node_modules/.bin/:${HOME}/.npm-global/bin/:${HOME}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Copy the rest of the files
COPY . ./

# Cleaning any existing generated file
# RUN rm -rf ./dist

# Build api
# RUN npm run build

# Application VOLUME
VOLUME ${HOME}

EXPOSE 6100

USER 1001

# Application Entry point
CMD ["npm", "run", "start"]

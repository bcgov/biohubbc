FROM node:10

ENV PORT 3002
ENV HOME /opt/app-root/src/app

# Creating HOME
USER 0
RUN mkdir -p ${HOME}
RUN chmod -R 777 ${HOME}
RUN chown -R 1001 ${HOME}
# Make Directory for uploading issue logs

RUN mkdir -p ${HOME}/../temp/uploads/issues
RUN chmod -R 777 ${HOME}/../temp/uploads/issues
USER 1001

# Setting Path
ENV PATH /opt/rh/rh-nodejs8/root/usr/bin:/opt/app-root/src/node_modules/.bin/:/opt/app-root/src/app.npm-global/bin/:/opt/app-root/src/app/bin:/opt/app-root/src/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/app-root/src/app/node_modules/.bin:/opt/app-root/src/app/app.npm-global/bin

# Create app directory

WORKDIR ${HOME}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
# RUN npm install --only=production
COPY ./package*.json ./

RUN npm install

# If you are building your code for production, copy all files
COPY ./ .

# Cleaning any existing generated file
RUN rm -rf ./dist

# Build the api dist
RUN npm run build

# Setting NODE_PATH
ENV NODE_PATH ${HOME}/node_modules

# Allow all user and app to update few folders
RUN chmod 777 ${HOME}/node_modules
RUN mkdir -p ${HOME}/.config/configstore
RUN chmod -R 777 ${HOME}/.config
RUN chmod -R 777 ${HOME}/.config/configstore

# Application VOLUME
VOLUME ${HOME}

# Application Port
EXPOSE 3002

# Application Entry point
CMD ["npm", "run", "start"]


# FROM node:10

# ENV PORT 3002
# ENV HOME /opt/app-root/src/app

# # Creating HOME
# # USER 0
# RUN mkdir -p ${HOME}
# # RUN chmod -R 777 ${HOME}
# # RUN chown -R 1001 ${HOME}

# # Setting Path
# ENV PATH /opt/rh/rh-nodejs8/root/usr/bin:/opt/app-root/src/node_modules/.bin/:/opt/app-root/src/app.npm-global/bin/:/opt/app-root/src/app/bin:/opt/app-root/src/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/app-root/src/app/node_modules/.bin:/opt/app-root/src/app/app.npm-global/bin

# # Create app directory

# WORKDIR ${HOME}

# # Install app dependencies
# # A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
# # RUN npm install --only=production
# COPY ./package*.json ./

# RUN npm install

# # If you are building your code for production
# # RUN npm install --only=production
# COPY . .

# # Cleaning any existing generated file
# RUN rm -rf ./dist

# # Build the api dist
# RUN npm run build

# # Setting NODE_PATH
# ENV NODE_PATH ${HOME}/node_modules

# # Application VOLUME
# VOLUME ${HOME}

# # Application Port
# EXPOSE PORT

# # Application Entry point
# CMD ["npm", "run", "start"]

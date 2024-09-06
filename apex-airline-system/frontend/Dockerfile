# Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=lts

# Base Image
FROM node:${NODE_VERSION}

WORKDIR /usr/src/app

ENV MONGODB_URI=${MONGODB_URI}

ENV JWT_SECRET=${JWT_SECRET}

ENV DB_NAME=${DB_NAME}

ENV EMAIL_CREDENTIALS=${EMAIL_CREDENTIALS}

# Copy the rest of the source files into the image.
COPY . .

# Download dependencies as a separate step to take adv antage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
RUN npm install
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run start

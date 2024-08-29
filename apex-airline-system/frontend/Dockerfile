# Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=lts

# Base Image
FROM node:21.7.2

WORKDIR /usr/src/app

ARG PUBLIC_BASE_URL
ENV PUBLIC_BASE_URL=${PUBLIC_BASE_URL}

ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

# Copy the rest of the source files into the image.
COPY . .

# Download dependencies as a separate step to take adv antage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
#RUN --mount=type=cache,target=/root/.npm \
 #   npm ci
RUN npm install
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run preview

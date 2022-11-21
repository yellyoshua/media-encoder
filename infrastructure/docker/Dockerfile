FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive

# Install dependencies nodejs, ffmpeg and ffprobe
RUN apt-get update -yq && apt-get install \
		curl \
		wget \
		build-essential \
		ffmpeg \
		dbus -yq

# Install node 17.x
RUN curl -sL https://deb.nodesource.com/setup_17.x | bash \
    && apt-get install nodejs -yq

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install --production

CMD ["tail", "-f", "/dev/null"]
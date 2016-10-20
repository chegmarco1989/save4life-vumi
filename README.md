Save4Life Vumi JavaScript sandbox application
=============================================

# Development

All application states are stored in `/src/app.js`

Run `grunt` to build the final application

# Running the application

## Docker image

The Dockerfile specifies a docker image that will run this application using the Vumi JavaScript sandbox worker. To run the docker image, you need to link to a container running Redis, RabbitMQ and the [Save4Life HTTP API](https://github.com/dirkcuys/save4life). 

In addition you would need to run another Vumi worker to receive messages. You can use [Junebug](https://github.com/praekelt/junebug) to setup a telnet worker or more like a SMPP transport.

You can build a new docker image using this file, or get the latest image from [Docker Hub](https://hub.docker.com/r/dirkcuys/save4life-vumi/)

Save4Life Vumi JavaScript sandbox application
=============================================

# Development

Application states are defined in `/src/app.js`, test are in `/test/*.js`.

Run `grunt` to build the final application

# Running the application

To run the application you will need docker. `Dockerfile` specifies a docker image that will run this application using the Vumi JavaScript sandbox worker. You will also need running Redis, RabbitMQ, Junebug, PostgreSQL and [Save4Life HTTP API](https://github.com/dirkcuys/save4life) images.

## RabbitMQ

RabbitMQ is used by Vumi to pass messages between transports and workers and also by the HTTP API for asynchronous tasks.

Run the latest rabbitmq image from https://hub.docker.com and setup a host, user and permissions to use

    docker exec -it vumienv_rabbitmq_1 rabbitmqctl add_vhost /guest
    docker exec -it vumienv_rabbitmq_1 rabbitmqctl add_user guest guest
    docker exec -it vumienv_rabbitmq_1 rabbitmqctl set_permissions -p /guest guest '.*' '.*' '.*'

## Redis

Run the latest Redis image from https://hub.docker.com

## Junebug

Run the [praekeltfoundation/junebug/](https://hub.docker.com/r/praekeltfoundation/junebug/) docker image from https://hub.docker.com with the following environment variables:

    REDIS_HOST=redis
    AMQP_HOST=rabbitmq
    AMQP_VHOST=/

The following port mappings:

    "8001:80"
    "8080:8080"
    "9010:9010"
    "9011:9011"

and linked to the redis and RabbitMQ containers as redis and rabbitmq respectively.

Create a USSD channel and outgoing SMS channel using curl:

Command to create USSD channel 

    curl -X POST \                                                              
       -d '{
        "type": "telnet",
        "label": "My First Channel",
        "amqp_queue": "ussd_transport",
        "config": {"twisted_endpoint": "tcp:9010"}
        }' \
    http://localhost:8080/channels/

Command to create outgoing SMS channel

    curl -X POST \
        -d '{
            "type": "telnet",
            "label": "SMS channel",
            "amqp_queue": "incoming_sms",
            "config": {"twisted_endpoint": "tcp:9011"} 
        }' \
    http://localhost:8080/channels/

Copy the link of the channel created, since you will need the address below when running the HTTP API image.

## PostgreSQL

Run the latest postgres:9.3 image from https://hub.docker.com and create a user and database for the API to use:

    docker exec -it vumienv_postgres_1 psql -U postgres
    CREATE USER save4life PASSWORD 'password';
    CREATE DATABASE save4life with owner save4life;

## HTTP API

Run the [latest image]() from https://hub.docker.com with the following environment variables:

    DATABASE_URL=postgres://save4life:password@postgres:5432/save4life
    BROKER_URL=amqp://guest:guest@rabbitmq//
    JUNEBUG_SMS_URL=http://junebug:8080/channels/202ae5bc-0be8-4390-8ab7-37fc691f4e9b/messages/
    AIRTIME_TERMINAL_NUMBER=
    AIRTIME_MSISDN=
    AIRTIME_PIN=
    AIRTIME_WSDL_URL=

The `JUNEBUG_SMS_URL` depends on the output of the `curl` command you used to setup the outgoing SMS channel on Junebug. You need to get the `AIRTIME_` variables from your WASP partner.

Link the container to the PostgreSQL, Junebug and RabbitMQ containers as postgres, rabbitmq and junebug respectively.

## Vumi go JavaScript sandbox worker

You can build a new docker image using the Dockerfile or get the latest image from [Docker Hub](https://hub.docker.com/r/dirkcuys/save4life-vumi/). Run the image using the following environment variables:

    AMQP_HOST=rabbitmq
    VUMI_OPT_transport_name=ussd_transport

and link to RabbitMQ, Redis and the HTTP API as rabbitmq, redis and api respectively.


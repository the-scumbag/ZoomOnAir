# ZoomOnAir

A zoom webhook handler that toggles Wyze smart lights/plugs on and off
when you enter and exit meetings. This code is intended to be deployed as a serverless function on [Vercel](https://vercel.com/)

## Setup notes

You can fork this repo and point your own vercel app at the forked code.

## Wyze Setup

This only works with Wyze smart Plugs or Bulbs. The code looks for any plug/bulb that have names prefixed with `zoom_`. You can have as many plugs/bulbs named with the prefix as you'd like. All of them will be toggled according to the zoom events.

## Zoom Setup

In Zoom, you will need to have Developer permissions for your account. Set up a "Webhook Only" app [here](https://marketplace.zoom.us/develop/create). Configure the "Event notification endpoint URL" with the url to your vercel app (see following step). Select the following for the "Event Types":

- Participant/Host joined meeting
- Participant/Host left meeting

Note the "Verification Token" to be used in vercel setup below.

## Vercel Setup

Point vercel at your forked repo. Note the app URL to be used for Zoom setup. Configure the following environment variables as Secrets:

- ZOOM_WEBHOOK_TOKEN
- ZOOM_PARTICIPANT
- WYZE_USERNAME
- WYZE_PASSWORD

** USE SECRET ENV VARIABLES TO ENSURE YOUR PASSWORDS ARE SAFE **

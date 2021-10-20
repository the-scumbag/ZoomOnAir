import {NowRequest, NowResponse} from '@vercel/node';
import Lifx from 'lifxjs';

const devicePrefix = 'zoom_';
const participantJoinedEvent = 'meeting.participant_joined';
const participantLeftEvent = 'meeting.participant_left';

export default async (request: NowRequest, response: NowResponse) => {
  const authValid =
    request.headers['authorization'] === process.env.ZOOM_WEBHOOK_TOKEN;

  const event = request.body.event;
  const participant = request.body.payload.object.participant;

  const isParticipantEvent =
    event &&
    participant &&
    (event === participantJoinedEvent || event === participantLeftEvent);

  if (!authValid || !isParticipantEvent) {
    // just return a 200, we don't want zoom to keep retrying for a non-2xx error;
    return response.status(200).send({});
  }

  console.log('Zoom authenticated...');
  console.log('Event parse successful...');

  const isValidParticipant = participant.email === process.env.ZOOM_PARTICIPANT;
  if (!isValidParticipant) {
    return response.status(200).send({});
  }

  console.log('Zoom participant verified...');
  console.log('Connecting to LIFX...');

  const options = {
    appToken: process.env.LIFX_TOKEN'
  };

  try {
    const lifx = new Lifx();
    lifx.init(options);
    const devices = await lifx.get.all();
    const filtered = devices.filter(
      (x) =>
        x.label.startsWith(devicePrefix)
    );

    const turnOn = event === participantJoinedEvent;

    console.log(`${turnOn ? 'Turning red!' : 'Turning green!'}`);
    const promises = filtered.map((device) =>
      lifx.color.light(device.id, { hue: (turnOn)?0:120, saturation: 1, brightness: 1 })
    );

    await Promise.all(promises);
  } catch (err) {
    console.log('LIFX ERROR: ', err);
  }

  response.status(200).send({});
};

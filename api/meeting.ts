import {NowRequest, NowResponse} from '@vercel/node';
import Wyze from 'wyze-node';

const deviceTypes = ['Plug', 'Light'];
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
  console.log('Connecting to Wyze...');

  const options = {
    username: process.env.WYZE_USERNAME,
    password: process.env.WYZE_PASSWORD,
  };

  try {
    const wyze = new Wyze(options);
    const devices = await wyze.getDeviceList();
    const filtered = devices.filter(
      (x) =>
        deviceTypes.includes(x.product_type) &&
        x.nickname.startsWith(devicePrefix),
    );

    const turnOn = event === participantJoinedEvent;

    console.log(`${turnOn ? 'Turning on!' : 'Turning off!'}`);
    const promises = filtered.map((device) =>
      turnOn ? wyze.turnOn(device) : wyze.turnOff(device),
    );

    await Promise.all(promises);
  } catch (err) {
    console.log('WYZE ERROR: ', err);
  }

  response.status(200).send({});
};

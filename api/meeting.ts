import {NowRequest, NowResponse} from '@vercel/node';
import Wyze from 'wyze-node';

const deviceTypes = ['Plug', 'Light'];
const devicePrefix = 'zoom_';

export default async (request: NowRequest, response: NowResponse) => {
  const event = request.body.event;
  if (
    request.headers['authorization'] !== process.env.ZOOM_WEBHOOK_TOKEN ||
    !event
  ) {
    // just return a 200, we don't want zoom to keep retrying for a non-2xx error;
    return response.status(200).send({});
  }

  const options = {
    username: process.env.WYZE_USERNAME,
    password: process.env.WYZE_PASSWORD,
  };

  console.log('connecting to wyze...');

  const wyze = new Wyze(options);
  const devices = await wyze.getDeviceList();
  const filtered = devices.filter(
    (x) =>
      deviceTypes.includes(x.product_type) &&
      x.nickname.startsWith(devicePrefix),
  );

  // const turnOn = event === 'meeting.started';
  const turnOn = true;
  const promises = filtered.map((device) =>
    turnOn ? wyze.turnOn(device) : wyze.turnOff(device),
  );
  await Promise.all(promises);

  response.status(200).send({});
};

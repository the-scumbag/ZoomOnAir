import {NowRequest, NowResponse} from '@vercel/node';

export default (request: NowRequest, response: NowResponse) => {
  console.log('ZOOM BODY:', {...request.body});

  console.log('CHECKING AUTH: ', process.env.ZOOM_WEBHOOK_TOKEN);
  if (request.headers['authorization'] !== process.env.ZOOM_WEBHOOK_TOKEN) {
    console.log('AUTH ERROR: ', request.headers['authorization']);
    return response.status(401);
  }

  response.status(200).send({});
};

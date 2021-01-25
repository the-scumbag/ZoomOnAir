import {NowRequest, NowResponse} from '@vercel/node';

export default (request: NowRequest, response: NowResponse) => {
  console.log('ZOOM REQUEST: ', {...request.body});
  response.status(200).send({});
};

import { createExpressApp } from '../server.js';

let appPromise = createExpressApp();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};

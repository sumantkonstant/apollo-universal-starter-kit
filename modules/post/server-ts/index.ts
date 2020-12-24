import express, { Express } from 'express';
import ServerModule from '@gqlapp/module-server-ts';

import Post from './sql';
import schema from './schema.graphql';
import createResolvers from './resolvers';
import fileSystemStorage from './FileSystemStorage';

const middleware = (app: Express) => {
  app.use('/public', express.static('public'));
};
export * from './FileSystemStorage';

export default new ServerModule({
  schema: [schema],
  appContext: {
    fileSystemStorage
  },
  createResolversFunc: [createResolvers],
  createContextFunc: [() => ({ Post: new Post() })],
  middleware: [middleware]
});

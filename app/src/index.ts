
  import { ApolloServer } from 'apollo-server';
  import { schema } from './schema';
  import { createContext } from './context';

  const serverConfig = {
    schema,
    context: createContext,
    playground: true,
    introspection: true,
    uploads: false,
  };

  const server = new ApolloServer(serverConfig);

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });

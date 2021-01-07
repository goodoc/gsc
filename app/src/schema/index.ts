
  import { makeSchema } from '@nexus/schema';
  import { nexusPrisma } from 'nexus-plugin-prisma';
  import path from 'path';
  import Post from './Post';
  import User from './User';
  import resolvers from '../resolvers';

  export const schema = makeSchema({
    types: [
      resolvers,
      Post,
      User,
    ],
    plugins: [nexusPrisma({ experimentalCRUD: true })],
    outputs: {
      schema: path.join(process.cwd(), 'schema.graphql'),
      typegen: path.join(process.cwd(), 'src/generated/nexus.ts'),
    },
    typegenAutoConfig: {
      contextType: 'Context.Context',
      sources: [
        {
          source: '@prisma/client',
          alias: 'prisma',
        },
        {
          source: require.resolve(`${__dirname}/../context`),
          alias: 'Context',
        },
      ],
    },
  });

  export default { schema };

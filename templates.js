

const packages = (path) => `{
  "name": "${path}",
  "scripts": {
    "start": "next start",
    "clean": "rm -rf dist",
    "build": "yarn clean && yarn generate && tsc",
    "generate": "yarn generate:prisma && yarn generate:nexus",
    "generate:prisma": "prisma generate",
    "migrate:save": "prisma migrate save --experimental",
    "studio": "prisma studio --experimental",
    "migrate:up": "prisma migrate up --experimental",
    "generate:nexus": "ts-node --transpile-only  -P nexus.tsconfig.json ./src/schema/index.ts",
    "dev": "ts-node --transpile-only src/index.ts",
    "lint": "yarn eslint . --ext ts,tsx",
    "lint:fix": "yarn eslint . --ext ts,tsx --fix",
    "test": "jest --detectOpenHandles --forceExit"
  },
  "dependencies": {
    "@nexus/schema": "0.17.0",
    "@prisma/cli": "2.11.0",
    "@prisma/client": "2.11.0",
    "@typescript-eslint/eslint-plugin": "^4.6.1",
    "apollo-server": "^2.19.1",
    "dotenv": "^8.2.0",
    "graphql": "15.4.0",
    "nexus-plugin-prisma": "^0.23.0"
  },
  "devDependencies": {
    "@types/jest": "^26.0.16",
    "@types/node": "12.19.2",
    "@types/node-fetch": "^2.5.7",
    "@types/webpack": "^4.41.25",
    "apollo-server-testing": "^2.19.0",
    "child_process": "^1.0.2",
    "eslint": "^7.5.0",
    "eslint-config-airbnb-typescript": "^10.0.0",
    "eslint-plugin-import": "^2.22.0",
    "eslint-plugin-jsx-a11y": "^6.3.1",
    "eslint-plugin-prettier": "^3.1.4",
    "eslint-plugin-react": "^7.20.3",
    "eslint-plugin-react-hooks": "^4.0.8",
    "husky": "^4.2.5",
    "jest": "^26.6.3",
    "lint-staged": "^10.2.11",
    "mysql2": "^2.2.5",
    "prettier": "^2.1.2",
    "ts-jest": "^26.4.4",
    "ts-node": "9.0.0",
    "ts-node-dev": "1.0.0-pre.50",
    "typescript": "4.0.5"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": "yarn lint"
  },
  "engines": {
    "node": ">=10.0.0"
  },
  "jest": {
    "preset": "ts-jest",
    "globals": {
      "ts-jest": {
        "diagnostics": {
          "warnOnly": true
        }
      }
    },
    "testEnvironment": "node"
  }
}
`

const prismaCli = `/* eslint-disable @typescript-eslint/no-empty-function */
import { PrismaClient } from '@prisma/client';

export default class Prisma {
  private static prisma: PrismaClient;

  private constructor() { }

  static getInstance() {
    if (!Prisma.prisma) {
      Prisma.prisma = new PrismaClient();
    }
    return Prisma.prisma;
  }
}
`;

const resolvers = `import query from './Query';
import mutation from './Mutation';

export default {
  query,
  mutation,
};
`;

const mutation = `import { mutationType } from '@nexus/schema';

export default mutationType({
  definition: (t) => {
    t.crud.createOnePost();
  },
});
`;

const query = `import { queryType } from '@nexus/schema';

export default queryType({
  definition: (t) => {
    t.crud.user();
    t.crud.posts({
      filtering: true,
    });
  },
});
`;

const schema = `import { makeSchema } from '@nexus/schema';
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
        source: require.resolve(\`\${__dirname}/../context\`),
        alias: 'Context',
      },
    ],
  },
});

export default { schema };
`;

const post = `import { objectType } from '@nexus/schema';

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id();
    t.model.title();
    t.model.content();
    t.model.writer();
  },
});
export default Post;
`;

const user = `import { objectType } from '@nexus/schema';

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.username();
    t.model.posts();
  },
});
export default User;
`;

const context = `import { PrismaClient } from '@prisma/client';
import Prisma from './prisma-cli';

export interface Context {
  prisma: PrismaClient;
}

export const createContext = async () => {
  const prisma = Prisma.getInstance();

  return { prisma };
};

export const createTestContext = async () => {
  const prisma = Prisma.getInstance();
  return { prisma };
};
`;

const server = `import { ApolloServer } from 'apollo-server';
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
  console.log(\`🚀  Server ready at \${url}\`);
});
`;

const prisma = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id Int @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  deletedAt  DateTime?
  username String
  password String
  posts Post[]
}

model Post {
  id Int @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  deletedAt  DateTime?
  title String
  content String
  writer User @relation(fields: [userId], references: [id])
  userId Int
}
`;

const env = () => 'DATABASE_URL=mysql://root:1234@localhost:3306/template'

const lintignore = `**/node_modules/*
**/out/*
**/dist/*
**/src/generated/*
**/.next/*
.babelrc
**/*.test.tsx
`

const lint = `{
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "airbnb-typescript"
  ],
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "parserOptions": {
    "project": "./tsconfig.json",
    "createDefaultProgram": true
  },
  "rules": {
    "max-len": 0,
    "no-console": [
      2,
      {
        "allow": [
          "warn",
          "log",
          "error"
        ]
      }
    ]
  }
}
`

const gitignore = `# Created by https://www.toptal.com/developers/gitignore/api/node,webst# Edit at https://www.toptal.com/developers/gitignore?templates=node,webstorm

### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
dist

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env*.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

### WebStorm ###
# Covers JetBrains IDEs: IntelliJ, RubyMine, PhpStorm, AppCode, PyCharm, CLion, Android Studio, WebStorm and Rider
# Reference: https://intellij-support.jetbrains.com/hc/en-us/articles/206544839

# User-specific stuff
.idea/**/workspace.xml
.idea/**/tasks.xml
.idea/**/usage.statistics.xml
.idea/**/dictionaries
.idea/**/shelf

# Generated files
.idea/**/contentModel.xml

# Sensitive or high-churn files
.idea/**/dataSources/
.idea/**/dataSources.ids
.idea/**/dataSources.local.xml
.idea/**/sqlDataSources.xml
.idea/**/dynamic.xml
.idea/**/uiDesigner.xml
.idea/**/dbnavigator.xml

# Gradle
.idea/**/gradle.xml
.idea/**/libraries

# Gradle and Maven with auto-import
# When using Gradle or Maven with auto-import, you should exclude module files,
# since they will be recreated, and may cause churn.  Uncomment if using
# auto-import.
# .idea/artifacts
# .idea/compiler.xml
# .idea/jarRepositories.xml
# .idea/modules.xml
# .idea/*.iml
# .idea/modules
# *.iml
# *.ipr

# CMake
cmake-build-*/

# Mongo Explorer plugin
.idea/**/mongoSettings.xml

# File-based project format
*.iws

# IntelliJ
out/

# mpeltonen/sbt-idea plugin
.idea_modules/

# JIRA plugin
atlassian-ide-plugin.xml

# Cursive Clojure plugin
.idea/replstate.xml

# Crashlytics plugin (for Android Studio and IntelliJ)
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties
fabric.properties

# Editor-based Rest Client
.idea/httpRequests

# Android studio 3.1+ serialized cache file
.idea/caches/build_file_checksums.ser

### WebStorm Patch ###
# Comment Reason: https://github.com/joeblau/gitignore.io/issues/186#issuecomment-215987721

# *.iml
# modules.xml
# .idea/misc.xml
# *.ipr

# Sonarlint plugin
# https://plugins.jetbrains.com/plugin/7973-sonarlint
.idea/**/sonarlint/

# SonarQube Plugin
# https://plugins.jetbrains.com/plugin/7238-sonarqube-community-plugin
.idea/**/sonarIssues.xml

# Markdown Navigator plugin
# https://plugins.jetbrains.com/plugin/7896-markdown-navigator-enhanced
.idea/**/markdown-navigator.xml
.idea/**/markdown-navigator-enh.xml
.idea/**/markdown-navigator/

# Cache file creation bug
# See https://youtrack.jetbrains.com/issue/JBR-2257
.idea/$CACHE_FILE$

# CodeStream plugin
# https://plugins.jetbrains.com/plugin/12206-codestream
.idea/codestream.xml

# End of https://www.toptal.com/developers/gitignore/api/node,webstorm
.vercel
`;

const jestConfig = `module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  preset: 'ts-jest',
};
`;

const jestSetup = `/* eslint-disable no-undef */
jest.setTimeout(5000);
`;

const nexusTsConfig = `{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "lib": ["esnext"],
    "esModuleInterop": true
  }
}
`;

const prettier = `// https://prettier.io/docs/en/options.html
module.exports = {
  trailingComma: 'es5',
  bracketSpacing: true,
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  arrowParens: 'always',
};
`;

const readme = `# Goodoc GQL Server

guide는 금방 쓸게요..
`;

const tsconfig = `{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "lib": [
      "esnext"
    ],
    "esModuleInterop": true,
    "strict": false,
    "target": "es5",
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": [
    "."
  ],
  "exclude": [
    "node_modules"
  ]
}
`;

module.exports = {
  packages,
  prismaCli,
  resolvers,
  mutation,
  query,
  schema,
  post,
  user,
  context,
  server,
  prisma,
  env,
  lintignore,
  lint,
  gitignore,
  jestConfig,
  jestSetup,
  nexusTsConfig,
  prettier,
  readme,
  tsconfig
}



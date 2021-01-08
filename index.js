#!/usr/bin/env node
const commander = require('commander');
const inquirer = require('inquirer');
const templates = require('./templates');
const fs = require('fs');
var _ = require('lodash');

const actions = {
  create: (path) => {
    if (fs.existsSync(path)) {
      console.error('Already exist path!')
      return
    }
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'db_type',
          message: 'Select the type of database to use',
          choices: ['mysql', 'postgresql']
        },
        {
          type: 'input',
          message: 'Enter the database user to use',
          name: 'db_user',
        },
        {
          type: 'input',
          message: 'Enter the database user\'s password to use',
          name: 'db_password',
        },
        {
          type: 'input',
          message: 'Enter the database url to use',
          name: 'db_url',
          default: 'localhost:3306'
        },
        {
          type: 'input',
          message: 'Enter the database name to use',
          name: 'database',
        }
      ])
      .then((inputs) => {
        try {
          const { db_type, db_user, db_password, db_url, database } = inputs
          const currentPath = process.cwd();
          const root = `${currentPath}/${path}`;
          console.log('Start initalizing your project!');
          fs.mkdirSync(`${root}`)
          fs.writeFileSync(`${root}/package.json`, templates.packages(path));
  
          // project path set
          fs.mkdirSync(`${root}/prisma`)
          fs.mkdirSync(`${root}/src`)
          fs.mkdirSync(`${root}/src/generated`)
          fs.mkdirSync(`${root}/src/resolvers`)
          fs.mkdirSync(`${root}/src/schema`)
          fs.mkdirSync(`${root}/src/prisma-cli`)
  
          fs.writeFileSync(`${root}/prisma/schema.prisma`, templates.prisma);
  
          fs.writeFileSync(`${root}/src/prisma-cli/index.ts`, templates.prismaCli);
          fs.writeFileSync(`${root}/src/resolvers/index.ts`, templates.resolvers);
          fs.writeFileSync(`${root}/src/resolvers/Mutation.ts`, templates.mutation);
          fs.writeFileSync(`${root}/src/resolvers/Query.ts`, templates.query);
          fs.writeFileSync(`${root}/src/schema/index.ts`, templates.schema);
          fs.writeFileSync(`${root}/src/schema/Post.ts`, templates.post);
          fs.writeFileSync(`${root}/src/schema/User.ts`, templates.user);
  
          fs.writeFileSync(`${root}/src/context.ts`, templates.context);
          fs.writeFileSync(`${root}/src/index.ts`, templates.server);
  
          // project env setup
          const db_env = `DATABASE_URL=${db_type}://${db_user}:${db_password}@${db_url}/${database}`
          fs.writeFileSync(`${root}/.env`, db_env);
          fs.writeFileSync(`${root}/.eslintignore`, templates.lintignore);
          fs.writeFileSync(`${root}/.eslintrc.json`, templates.lint);
          fs.writeFileSync(`${root}/.gitignore`, templates.gitignore);
          fs.writeFileSync(`${root}/jest.config.js`, templates.jestConfig);
          fs.writeFileSync(`${root}/jest.setup.js`, templates.jestSetup);
          fs.writeFileSync(`${root}/nexus.tsconfig.json`, templates.nexusTsConfig);
          fs.writeFileSync(`${root}/prettier.config.js`, templates.prettier);
          fs.writeFileSync(`${root}/README.md`, templates.readme);
          fs.writeFileSync(`${root}/tsconfig.json`, templates.tsconfig);

          console.log('It\'s done!');
          console.log('Happy Hacking :)');
        } catch (err) {
          console.error(err);
        }
      })
  },
  model: (model) => {
    const currentPath = process.cwd();
    const prismaPath = `${currentPath}/prisma/schema.prisma`;
    const modelName = _.chain(model).camelCase().capitalize().value();
    const schemaPath = `${currentPath}/src/schema/${modelName}.ts`; 
    if (!fs.existsSync(prismaPath)) {
      console.error('Prisma file is not exist!')
      return
    }

    if (fs.existsSync(schemaPath)) {
      console.error('Already exist schema!')
      return
    }

    const { prismaModel, schema } = templates.getModelTemplate(modelName)

    fs.appendFileSync(`${currentPath}/prisma/schema.prisma`, prismaModel)
    fs.writeFileSync(schemaPath, schema);

    let schemaFile = fs.readFileSync(`${currentPath}/src/schema/index.ts`, { encoding: 'utf8' })

    schemaFile = `import ${modelName} from './${modelName}';\n` + schemaFile
    const standard = '  ],\n  plugins: [nexusPrisma({ experimentalCRUD: true })]'
    const splited = schemaFile.split(standard)
    let types = splited[0];
    types = types + `    ${modelName},\n${standard}`
    const newModelAppendedSchema = types + splited[1];

    fs.writeFileSync(`${currentPath}/src/schema/index.ts`, newModelAppendedSchema)
  },
  resolver: (model) => {
    const currentPath = process.cwd();
    const modelName = _.chain(model).camelCase().capitalize().value();
    const resolverName = `${modelName}Resolver`;
    const resolverPath = `${currentPath}/src/resolvers/${resolverName}.ts`;
    if (fs.existsSync(resolverPath)) {
      console.error('Already exist resolver!')
      return
    }
    fs.writeFileSync(resolverPath, templates.customResolver);
    const resolverIndexPath = `${currentPath}/src/resolvers/index.ts`

    let schemaFile = fs.readFileSync(resolverIndexPath, { encoding: 'utf8' })
    schemaFile = `import ${resolverName} from './${resolverName}';\n` + schemaFile;
    const standard = 'export default {\n'
    const splited = schemaFile.split(standard);
    let resolvers = splited[1];
    resolvers = `  ${resolverName},\n` + resolvers;
    const merged = splited[0] + standard + resolvers;

    fs.writeFileSync(resolverIndexPath, merged);
  },
}

commander
  .arguments("<action> <target>")
  .action(function(action, target) {
    const selectedAction = actions[action];
    selectedAction(target);
  })
  .parse(process.argv);
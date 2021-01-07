#!/usr/bin/env node
const commander = require('commander');
const inquirer = require('inquirer');
const templates = require('./templates');
const fs = require('fs');

const actions = {
  create: (path) => {
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
        },
        {
          type: 'list',
          message: 'Select the type of package manager',
          name: 'package_manager',
          choices: ['npm', 'yarn']
        },
      ])
      .then((inputs) => {
        const { db_type, db_user, db_password, db_url, database, package_manager } = inputs
        const root = `${__dirname}/${path}`;
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
      })
  }
}

commander
  .arguments("<action> <path>")
  .action(function(action, path) {
    const selectedAction = actions[action];
    selectedAction(path);
  })
  .parse(process.argv);
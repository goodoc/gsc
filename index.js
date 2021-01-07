#!/usr/bin/env node
const commander = require('commander');

commander
  .command('create')
  .action(() => {
    console.log('create!');
  })
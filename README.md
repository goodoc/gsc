# Goodoc Sever template cli

## Install
```
npm install -g goodoc-server-cli 
```

## How to use
### Create Project
* Create dir project for new project
```
gsc create [ProjectName]
cd [ProjectName]

// Add dependency yarn or npm install
yarn

// prisma & nexus generate
yarn generate

// server start
yarn dev
```

### Add Model
* Append prisma model & add schema
```
gsc model [NewModelName]
```

### Add Resolver
* Add custom resolver
```
gsc resolver [NewResolverName]
```
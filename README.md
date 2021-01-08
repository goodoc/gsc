# Goodoc Sever template cli

## Introduce
This is cli for setting one template case of GraphQL + ApolloServer + Prisma2 + Nexus in a Goodoc

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
// update model in schema.prisma & src/schema/[NewModelName]
yarn generate

```

### Add Resolver
* Add custom resolver
```
gsc resolver [NewResolverName]
// update example custom resolver in src/resolvers/[NewResolverName]Resolver
yarn generate
```
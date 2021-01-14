
  /* eslint-disable @typescript-eslint/no-empty-function */
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

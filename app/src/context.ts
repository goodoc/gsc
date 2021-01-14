
  import { PrismaClient } from '@prisma/client';
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

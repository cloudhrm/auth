import { getUserId } from '../utils'

async function mycompany(parent, args, { prisma, request }, info) {
  const userId = await getUserId(prisma, request)
  return await prisma.companies({ where: { owner: { id: userId } } })
}

async function me(parent, args, { prisma, request }, info) {
  const userId = await getUserId(prisma, request)
  return await prisma.user({ id: userId })
}

async function key(parent, { id }, { prisma }, info) {
  const keypair = await prisma.keyPair({ id })
  if (!keypair) {
    throw new Error('No such key')
  }
  return keypair.public
}

export const Query = { mycompany, key, me }

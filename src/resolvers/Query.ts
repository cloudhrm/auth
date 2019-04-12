import { getUserId } from '../utils'

async function mycompany(parent, args, context, info) {
  const userId = await getUserId(context)
  return await context.prisma.companies({ where: { owner: { id: userId } } })
}

async function me(parent, args, context, info) {
  const userId = await getUserId(context)
  return await context.prisma.user({ id: userId })
}

async function key(parent, args, context, info) {
  const keypair = await context.prisma.keyPair({ id: args.id })
  if (!keypair) {
    throw new Error('No such key')
  }
  return keypair.public
}

export const Query = { mycompany, key, me }

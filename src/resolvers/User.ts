async function groups({ id }, args, { prisma }) {
  return await prisma.user({ id }).groups()
}

export const User = { groups }

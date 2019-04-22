function owner({ id }, args, { prisma }) {
  return prisma.company({ id }).owner()
}

function groups({ id }, args, { prisma }) {
  return prisma.company({ id }).groups()
}

export const Company = { owner, groups }

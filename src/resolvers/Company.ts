function owner(parent, args, context) {
  return context.prisma.company({ id: parent.id }).owner()
}

function groups(parent, args, context) {
  return context.prisma.company({ id: parent.id }).groups()
}

export const Company = { owner, groups }

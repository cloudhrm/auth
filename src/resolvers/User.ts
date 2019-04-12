async function groups(parent, args, context) {
  return await context.prisma.user({ id: parent.id }).groups()
}

export const User = { groups }

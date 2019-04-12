import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'
import { Query } from './resolvers/Query'
import { Mutation } from './resolvers/Mutation'
import { User } from './resolvers/User'
import { Company } from './resolvers/Company'

const resolvers = {
  Query,
  Mutation,
  User,
  Company
}

require('dotenv').config()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => {
    return {
      ...request,
      prisma
    }
  }
})

export default server

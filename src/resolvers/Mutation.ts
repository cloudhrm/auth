import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { getPrivateKey, getUserId } from '../utils'

async function rotateKey(parent, args, context, info) {
  const { generateKeyPair } = require('crypto')
  const util = require('util')
  const genKeyPair = util.promisify(generateKeyPair)
  const { publicKey, privateKey } = await genKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })
  const { id } = await context.prisma.createKeyPair({
    private: privateKey,
    public: publicKey
  })
  return id
}

async function createCompany(parent, args, context, info) {
  const userId = await getUserId(context)
  const company = await context.prisma.createCompany({
    name: args.name,
    company: args.company,
    owner: { connect: { id: userId } }
  })
  await context.prisma.createGroup({
    name: 'admin',
    company: { connect: { id: company.id } },
    users: { connect: [{ id: userId }] }
  })
  return company
}

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.createUser({ ...args, password })
  const keypair = await getPrivateKey(context)
  let token = ''
  if (keypair.private) {
    token = jwt.sign({ userId: user.id, keyId: keypair.id }, keypair.private, {
      algorithm: 'RS256'
    })
  } else {
    throw new Error('Please generate key pair')
  }

  return {
    token,
    user
  }
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user({ email: args.email })
  if (!user) {
    throw new Error('No such user found')
  }
  const groups = await context.prisma.user({ id: user.id }).groups()

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const keypair = await getPrivateKey(context)
  let token = ''
  if (keypair.private) {
    token = jwt.sign(
      { userId: user.id, keyId: keypair.id, groups },
      keypair.private,
      {
        algorithm: 'RS256'
      }
    )
  } else {
    throw new Error('Please generate key pair')
  }

  return {
    token,
    user
  }
}

export const Mutation = { createCompany, signup, login, rotateKey }

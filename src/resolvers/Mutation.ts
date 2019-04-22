import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { getPrivateKey, getUserId } from '../utils'

async function rotateKey(parent, args, { prisma }, info) {
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
  const { id } = await prisma.createKeyPair({
    private: privateKey,
    public: publicKey
  })
  return id
}

async function createCompany(parent, args, { prisma, request }, info) {
  const userId = await getUserId(prisma, request)
  const company = await prisma.createCompany({
    name: args.name,
    company: args.company,
    owner: { connect: { id: userId } }
  })
  await prisma.createGroup({
    name: 'admin',
    company: { connect: { id: company.id } },
    users: { connect: [{ id: userId }] }
  })
  return company
}

async function signup(parent, args, { prisma }, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await prisma.createUser({ ...args, password })
  const keypair = await getPrivateKey(prisma)
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

async function login(parent, { email, password }, { prisma }, info) {
  const user = await prisma.user({ email })
  if (!user) {
    throw new Error('No such user found')
  }
  const groups = await prisma.user({ id: user.id }).groups()

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const keypair = await getPrivateKey(prisma)
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

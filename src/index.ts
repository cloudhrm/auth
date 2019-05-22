import server from './server'
const consul = require('consul')({
  host: process.env.CONSUL_HOST || 'localhost'
})

require('dotenv').config()

function normalizePort(portin: string | number): string | number {
  const portNumber: number =
    typeof portin === 'string' ? parseInt(portin, 10) : portin
  if (isNaN(portNumber)) {
    return portin
  } else {
    return portNumber
  }
}

const port = normalizePort(process.env.AUTH_PORT || 4000)

server.start({ port }, async () => {
  const dns = require('dns')
  const { address } = await dns.lookup(process.env.AUTH_HOST || 'localhost')
  console.log(`Server is running on http://${address}:${port}`)
  const CONSUL_ID = require('uuid').v4()
  const details = {
    name: 'auth',
    address,
    port,
    id: CONSUL_ID,
    check: {
      ttl: '10s',
      deregister_critical_service_after: '1m'
    }
  }
  consul.agent.service.register(details, err => {
    if (err) throw new Error(err)
    setInterval(() => {
      consul.agent.check.pass({ id: `service:${CONSUL_ID}` }, err => {
        if (err) throw new Error(err)
      })
    }, 5 * 1000)
    process.on('SIGINT', () => {
      console.log('SIGINT. De-Registering...')
      const details = { id: CONSUL_ID }

      consul.agent.service.deregister(details, err => {
        console.log('de-registered.', err)
        process.exit()
      })
    })
  })
})

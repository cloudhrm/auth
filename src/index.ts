import server from './server'
const consul = require('consul')({
  host: process.env.CONSUL_HOST || 'localhost'
})
const port = 4000

require('dotenv').config()

server.start({ port }, () => {
  console.log(`Server is running on http://localhost:4000`)
  const CONSUL_ID = require('uuid').v4()
  const details = {
    name: 'auth',
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

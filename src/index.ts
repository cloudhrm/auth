import server from './server'

server.start({ port: 4000 }, () =>
  console.log(`Server is running on http://localhost:4000`)
)

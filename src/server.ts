import { app } from './app'
app
  .listen({
    // host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('app is runing in the port:3333')
  })

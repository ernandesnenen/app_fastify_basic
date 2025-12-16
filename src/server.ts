import { app } from './app'
import { env } from './env/index'
app
  .listen({
    // host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('app is runing in the port:3333')
  })

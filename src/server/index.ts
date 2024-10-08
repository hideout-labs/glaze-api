import { serve } from '@hono/node-server'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { renderTrpcPanel } from 'trpc-panel'
import { appRouter } from '~/server/routers/app'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
  })
)

app.get('/docs', (c) => {
  const html = renderTrpcPanel(appRouter, {
    url: `/trpc`,
  });

  return c.html(html);
});

const port = 4001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

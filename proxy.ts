import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/next'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/'])

const aj = arcjet({
  // todo : Add typesafety ts for env variables
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: 'LIVE',
    }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: "1m",
      max:100
    })
  ]
})


export default clerkMiddleware(async (auth, req) => {


  const decision = await aj.protect(req)
  console.log("Arcjet decision", decision);
  if (decision.isDenied()) {
    throw new Response('Forbidden', { status: 403 })
  }


  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

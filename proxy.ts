import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/next'

// setting up clerk in app
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { env } from './data/env/server'


// specifying public routes that doesn't require authentication
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', "/api/webhooks(.*)"])


// setting up arcjet bot protection middleware with 3 rules
// using arcjet we can block malicious requests
const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ // shield to block all bots
      mode: 'LIVE',
    }),
    detectBot({ // detectBot to allow good bots 
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({ // sliding window to limit requests to 100 per minute
      mode: 'LIVE',
      interval: "1m",
      max:100
    })
  ]
})


export default clerkMiddleware(async (auth, req) => {

  // Took Decision after applying all the rules
  const decision = await aj.protect(req);

  if (decision.isDenied()) {

    console.log('Proxy: Request blocked by Arcjet');
    throw new Response('Forbidden', { status: 403 })
  }

  // checking if the route is protected or not by clerk
  if (!isPublicRoute(req)) {
    await auth.protect()
    console.log('Proxy: Protected route accessed');
  }
})


// matcher regex expression to apply the middleware to all routes except next internal assets and api routes except webhooks api route and sign in page which is public route and should be accessible without authentication

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

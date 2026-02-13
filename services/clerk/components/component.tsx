import { ReactNode } from 'react'
import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs'


// custom clerk provider

const CustomClerkProvider  = ({children}: {children: ReactNode}) => {
  return (
    <OriginalClerkProvider>
      {children}
    </OriginalClerkProvider>
  )
}

export default CustomClerkProvider 
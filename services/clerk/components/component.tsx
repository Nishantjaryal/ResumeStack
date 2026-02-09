import { ReactNode } from 'react'
import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs'

const CustomClerkProvider  = ({children}: {children: ReactNode}) => {
  return (
    <OriginalClerkProvider>
      {children}
    </OriginalClerkProvider>
  )
}

export default CustomClerkProvider 
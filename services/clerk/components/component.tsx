import { ReactNode } from 'react'
import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs'


// custom clerk provider

const CustomClerkProvider  = ({children}: {children: ReactNode}) => {
  return (
    <OriginalClerkProvider
    appearance={
      {
        cssLayerName:"vendor",
        variables: {
          colorBackground: "var(--color-background)",
          borderRadius: "var(--radius-md)",
          colorBorder: "var(--color-border)",
          colorDanger: "var(--color-destructive)",
          colorForeground: "var(--color-foreground)",
          colorPrimary: "var(--color-primary)",
          colorInput: "var(--color-input)",
          colorShadow: "var(--color-shadow)",
          colorSuccess: "var(--chart-2)",
          colorWarning: "var(--color-warning)",
          colorMutedForeground: "var(--color-muted-foreground)",
          fontFamily: "var(--font-sans)",
        }
      }
    }
    >
      {children}
    </OriginalClerkProvider>
  )
}

export default CustomClerkProvider 
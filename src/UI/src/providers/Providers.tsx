'use client';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { ReactNode, useEffect } from 'react';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode('gray.50', 'gray.900')(props),
        color: mode('gray.800', 'gray.100')(props)
      }
    })
  },
  fonts: {
    heading: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    body: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
  }
});

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Avoid Konva warnings by ensuring canvas is available
  }, []);
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      {children}
    </ChakraProvider>
  );
}



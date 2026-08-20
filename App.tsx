import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/tanstack/queryClient';
import RootNavigation from './src/navigations/RootNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { PaperTheme } from './src/const/theme/PaperTheme';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={PaperTheme} >
            <RootNavigation />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import { queryClient } from './src/lib/tanstack/queryClient';
import { PaperTheme } from './src/const/theme/PaperTheme';
import RootNavigation from './src/navigations/RootNavigation';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={PaperTheme}>
            <NavigationContainer>
              <StatusBar barStyle={"light-content"} />
              <RootNavigation />
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
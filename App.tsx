import React from 'react';
import 'react-native-reanimated'
import 'react-native-gesture-handler'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { queryClient } from './src/lib/tanstack/queryClient';
import { PaperTheme } from './src/const/theme/PaperTheme';
import RootNavigation from './src/navigations/RootNavigation';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={PaperTheme}>
            <NavigationContainer theme={NavigationDarkTheme}>
              <StatusBar barStyle={"light-content"} />
              <FlashMessage
                position="top"
                floating={true}
                duration={2500}
              />
              <RootNavigation />
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
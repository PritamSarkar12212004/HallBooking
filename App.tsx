import React from 'react';
import codePush from '@revopush/react-native-code-push';
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
import { store } from './src/store';
import { Provider } from 'react-redux';
import ErrorWrapper from './src/layouts/wraper/ErrorWrapper';

const App = () => {
  return (
    <ErrorWrapper >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={PaperTheme}>
              <Provider store={store}>
                <NavigationContainer theme={NavigationDarkTheme}>
                  <StatusBar barStyle={"light-content"} />
                  <FlashMessage
                    position="top"
                    floating={false}
                    duration={2500}
                    statusBarHeight={
                      StatusBar.currentHeight ?? 0
                    }
                  />
                  <RootNavigation />
                </NavigationContainer>
              </Provider>
            </PaperProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorWrapper>
  );
};

export default codePush(App);
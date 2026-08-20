package com.hallbooking

import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "HallBooking"

  /**
   * Configure React Native Screens FragmentFactory before
   * React Native restores fragments.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()

    super.onCreate(savedInstanceState)
  }

  /**
   * Returns the instance of the ReactActivityDelegate.
   * New Architecture / Fabric is enabled.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
      )
}
# AR Real Estate

### Current version: RELEASE 0.6
 
This is an Andoid app for my Bachelor degree project. It is just a basic implementation - a proof of concept. 

The app uses Augmented Reality to display real estate offers on buildings near the user.

The Location Providing Alorithm is well optimized and set to provide the most accurate location (delta 0.5-2 meters) in the shortest time. Due to device's gear and software limitations the update time may vary between devices and it is rather impossible to deliver updates in iterval shorter that 5 seconds. The device used for building this application is **Huawei Mate 20 Pro** with **Android 9** and the location updates are provided in every 5-7 seconds.

### Technologies:

  - Wikitude AR (Wikitude Android JavaScript API) - the whole AR world behaviour implementation
  - Java for Android Native features and device management (location providing, camera operating, event handling, etc.)
  
### Installation

  - min SDK version **28*** (***Android 9***)
  - target SDK version **29** (***Android 10***)

But there is no problem with compiling to lower versions. Just make sure your device supports AR Core - min SDK **27** (***Android 7***)

### Here's a demo:

YouTube link: https://youtu.be/UEC7nVfK9UA 

![Demo sample](https://github.com/BrieflyClear/ar_real_estate-android/blob/master/misc/preview.gif)

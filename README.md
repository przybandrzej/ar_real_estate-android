# AR Real Estate

### Current version: RELEASE 0.5
 
This is an Andoid app for my Bachelor degree project. It is just a basic implementation - a proof of concept. 

The app uses Augmented Reality to display real estate offers on buildings near the user.

The Location Providing Alorithm is well optimized and set to provide the most accurate location (delta 0.5-2 meters) in the shortest time. Due to device's gear and software limitations the update time may vary between devices and it is rather impossible to deliver updates in iterval shorter that 5 seconds. The device used for building this application is **Huawei Mate 20 Pro** with **Android 9** and the location updates are provided in every 5-7 seconds.

### Technologies:

  - [Wikitude AR](https://www.wikitude.com/) (Wikitude Android JavaScript API) - the whole AR world behaviour implementation.
  ***There is a Wikitude EDU license that works only with this project***
  - Java for Android Native features and device management (location providing, camera operating, event handling, etc.)
  
### Device Requirements

  - min SDK version **28** (***Android 9***)
  - target SDK version **29** (***Android 10***)

But there is no problem with compiling to lower versions. Just make sure your device supports AR Core - min SDK **27** (***Android 7***). You can change the SDK target in `build.gradle` file.

### Set up and install

1. Find file `assets/location-sources/offers-0_1.js` and fill it with locations from your area like the given examples (you can delete them).
2. Make sure your device supports Ar Core (min Android 7.0).
3. Check if ***min SDK*** and ***target SDK*** in `buld.gradle` corresponds to your device's SDK version. If not you can try to change it.
4. Build and install.
5. Turn on location service, Wi-Fi or mobile data in your device.
6. Grant the permissions to use camera, internet and location.
7. Go out and try it out!

### IMPORTANT NOTE!

Due to occasional problems with providing altitude by some devices (sometimes they just set the altitude to 0m above the sea level), I decided to 'fake' the altitude. I manually set the user's altitude to 0 and the offer's markre's altitude to 3m, so the markers are always a little above the user. If you want you can try other approach.

### Here's a demo:

YouTube link: https://youtu.be/UEC7nVfK9UA 

![Demo sample](https://github.com/BrieflyClear/ar_real_estate-android/blob/master/misc/preview.gif)

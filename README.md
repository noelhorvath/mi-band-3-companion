# Mi Band 3 Companion
Ionic 6 (Angular) application for Mi Band 3

## Build info
* Don't forget to add your own environment config for Firebase under /src/environments
* After running npm install replace capacitor-firebase-auth/dist with resources/capacitor-firebase-auth/dist (3.0.0)
  or alternatively: 
    1. use firebase 8.x.x instead of firebase 9.x.x
    2. replace every import firebase from 'firebase/app'; in capacitor-firebase-auth plugin files with import firebase from 'firebase/compat/app';
      if you are using firebase 9.x.x or higher version
    3. use newer version of the plugin if available and supports firebase 9.x.x

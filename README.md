In beta, it works only for Android devices...

For Android :
# Install
```
npm install -g cordova-livereload
```

# Usage
In a cordova based project directory
```
cordova-livereload 
```
From another directory
```
cordova-livereload <path to a cordova-based project>
```
Choose devices and / or emulator to livereload
```
cordova-livereload -list-devices 
```
or
```
cordova-livereload -l 
```
With custom cordova commands
```
cordova-livereload cordova run android --nobuild --target=Android_7.1.1
```
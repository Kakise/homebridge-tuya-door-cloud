# Homebridge Tuya Door Sensor Plugin

This plugin allows you to use a Tuya compatible door sensor such as [this one](https://www.aliexpress.com/item/1-10PCS-Tuya-Smart-WiFi-Door-Sensor-Door-Open-Closed-Detectors-WiFi-App-Notification-Alert-alarm/1005002199685362.html?spm=a2g0s.12269583.0.0.3931791cDXxTrM) and shows it in the Home App through Homebridge.
It uses the Tuya Cloud API to get the device state and update it in Homebridge.

### What does this plugin NOT do ?
It's not a replacement for a proper security system (even though that's how I use it myself).  
It doesn't allow you to open/close a door, even though that's how Homekit want's a door to operate.  
It doesn't send your secret key over to Internet.  
It doesn't watch your sensor in realtime.

### What does this plugin do ?
It calls the Tuya Cloud API to update the door state.

# Homebridge Tuya Door Sensor Plugin

This plugin allows you to use a Tuya compatible door sensor such as [this one](https://www.aliexpress.com/item/1-10PCS-Tuya-Smart-WiFi-Door-Sensor-Door-Open-Closed-Detectors-WiFi-App-Notification-Alert-alarm/1005002199685362.html?spm=a2g0s.12269583.0.0.3931791cDXxTrM) and shows it in the Home App through Homebridge.
It uses the Tuya Cloud API to get the device state and update it in Homebridge.

You can support me buy sending some bucks my way on paypal: [right here](https://paypal.me/kakiseStash)

### What does this plugin NOT do ?
It's not a replacement for a proper security system (even though that's how I use it myself).  
It doesn't allow you to open/close a door, even though that's how Homekit want's a door to operate.  
It doesn't send your secret key over to Internet.  
It doesn't watch your sensor in realtime.

### What does this plugin do ?
It calls the Tuya Cloud API to update the door state and push it directly to Homebridge.  
It checks for the current door state in the background once every 500ms. Per my personal testing, this was as fast as the Tuya App notifications and works fine. The request are very small in size so it shouldn't use your internet too much. Still, I'd recommend to have a no data cap connection.

## How to use it
You need create an account on [iot.tuya.com](https://iot.tuya.com). Then, create a new Cloud project, with the industry type set to **"Smart Home"**. Go to "API" inside your project, add the "Authorization" and "Smart Home Devices Management" (don't worry, they are free).

Then you need to add your devices. For that, install the Tuya Smart app on your smartphone, make an account and then, go to "Link Devices" in your Cloud project.  
Select the "Link devices by App Account" and add your newly created account.

Go to device list and note the device IDs of your door sensors, you'll need them to setup.

Finally, go to the homebridge config ux and follow the instructions there.

### Manual configuration
If for some reason the Homebridge UI doesn't work (it's the case for me), here's a JSON Config example for you :

```
{
    "bridge": {
        "name": "Homebridge XXXX",
        "username": "XX:XX:XX:XX:XX:XX",
        "port": XXXX,
        "pin": "XXX-XX-XXX"
    },
    "accessories": [],
    "platforms": [
        {
            "name": "Config",
            "port": 8581,
            "platform": "config"
        },
        {
            "name": "TuyaDoorCloud",
            "options": {
                "access_id": "YOUR ACCESS ID",
                "secret_id": "YOUR SECRET KEY",
                "cloudCode": "YOUR REGION"
            },
            "defaults": [
                {
                    "display_name": "SENSOR 1",
                    "device_id": "DEVICE ID 1"
                },
                {
                    "display_name": "SENSOR 2",
                    "device_id": "DEVICE ID 2"
                }
            ],
            "platform": "TuyaDoorCloud"
        }
    ],
    "disabledPlugins": []
}
```

## Build it yourself
To build this project, first run
```npm install```
Then
```npm run build```
And finally
```npm link```
To attach this plugin to homebridge

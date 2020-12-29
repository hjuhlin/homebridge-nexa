
<p align="center">
<img alt="Home Bridge logotype" src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge Platform Nexa Bridge X Plugin
This is a plugin for Nexa Bridge X (1.7 and forward).

# Support for
* Switches (Plug-in PÅ/AV) (not dimmer yet!)
* Magnetic contact (Magnetkontakt)
* Twilight relay (skymningsrelä) - 1 = night, 100 = day. 

Add issues for items you want support for

# Default config
```json
"platforms": [
    {
        "name": "Nexa Bridge X",
        "username": "nexa",
        "password": "nexa",
        "ip": "192.168.0.X",
        "UpdateTime": 60,
        "platform": "NexaBridgeX"
    }
]
```

# Inspiration from 
I did get a lot of tips and inspiration on Nexa API calls from this plugin.
https://bitbucket.org/Skjaar/homebridge-nexabridge/src/master/
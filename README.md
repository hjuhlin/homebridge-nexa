
<p align="center">
<img alt="Home Bridge logotype" src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge Platform Nexa Bridge X Plugin
This is a plugin for Nexa Bridge X (1.7 and forward).

# Support for
1.0.0
* Switches
* Virtual Switches
* Magnetic contact
* Twilight relay - 1 = night, 100 = day. 

1.1.0
* Switches with dimmer

1.2.0
* Motion detectors

1.3.0
* Remote controls

1.3.1 + 1.3.2 + 1.3.3
* Bug fixes (rewrite on get and set values)

1.4.0 + 1.4.1 + 1.4.2
* Thermometer & Humidity sensor (NBN-001)

1.4.3
* Removed Switches with dimmer for now

1.5.0
* Rewrite of code to make it work better with accessories that have multiple capabilities like Thermometer & Humidity sensor (NBN-001)

Add issue for other devices/accessories you want support for

# Default config
```json
"platforms": [
    {
        "name": "Nexa Bridge X",
        "username": "nexa",
        "password": "nexa",
        "ip": "192.168.0.X",
        "UpdateTime": 5,
        "platform": "NexaBridgeX"
    }
]
```

# Inspiration from 
I did get a lot of tips and inspiration on Nexa API calls from this plugin.
https://bitbucket.org/Skjaar/homebridge-nexabridge/src/master/
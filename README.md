<p align="center">
<img alt="Home Bridge logotype" src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge Platform Nexa Bridge X Plugin

This is a plugin for Nexa Bridge X (1.7 and forward).

# Support for

1.0.0

- Switches
- Magnetic contact
- Twilight relay - 1 = night, 100 = day.

  1.1.0

- Switches with dimmer

  1.2.0

- Motion detectors

  1.3.0

- Remote controls

  1.3.1 + 1.3.2 + 1.3.3

- Bug fixes (rewrite on get and set values)

  1.4.0 + 1.4.1 + 1.4.2

- Thermometer & Humidity sensor (NBN-001)

  1.4.3

- Removed Switches with dimmer for now

  1.5.0

- Rewrite of code to make it work better with accessories that have multiple capabilities like Thermometer & Humidity sensor (NBN-001)

  1.5.1, 1.5.2. 1.5.3

- Bugfixes with old data. Added an option to remove all during start up, to clear old bugged values

  1.6.0

- Rewrite of code to support Z-wave items that does not report correct capabilities.

  1.7.0

- Added support for luminance sensor

  1.7.1

- Bug fix for switches

  1.8.6

- Current power consumption for Switches (outlets) (active if power is bigger then PowerConsumptionLimit in config)

  1.9.0

- Update for Homebridge >= 1.3.0

  1.9.1

- Bug fix for CurrentAmbientLightLevel

  2.0.0, 2.0.1, 2.0.2, 2.0.3

- Added support for Eve statistics (problem with enery)

  2.1.0, 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5

- Added support for CURRENT TotalPowerConsumption (lost at restart)

  2.2.0

- Added support for TotalPowerConsumption (stored in file)

  2.3.0

- Changed Eve stats from 9 min to 10 min.

  2.4.0

- Hiding devices that are hidden in app

  2.5.0

- Trying to fix server crash if Nexa Brige is not found

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
        "EveLoging": false,
        "Debug": false,
        "platform": "NexaBridgeX"
    }
]
```

# Inspiration from

I did get a lot of tips and inspiration on Nexa API calls from this plugin.
https://bitbucket.org/Skjaar/homebridge-nexabridge/src/master/

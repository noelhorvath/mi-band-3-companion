export const miBand3BLEData = () => {
  return `[
      {
          "name": "Generic Access Service",
          "uuid": "00001800-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "Device Name",
                  "uuid": "00002a00-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Appearance",
                  "uuid": "00002a01-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Peripheral Preferred Connection Parameters",
                  "uuid": "00002a04-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              }]
      },
      {
          "name": "Generic Attribute Service",
          "uuid": "00001801-0000-1000-8000-00805f9b34fb",
          "characteristics": [{
              "name": "Service Changed",
              "uuid": "00002a05-0000-1000-8000-00805f9b34fb",
              "properties": [
                  {
                      "name": "INDICATE"
                  },
                  {
                      "name": "READ"
                  }],
              "descriptor": {
                  "uuid": "00002902-0000-1000-8000-00805f9b34fb"
              }
          }]
      },
      {
          "name": "Device Information Service",
          "uuid": "0000180a-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "Serial Number String",
                  "uuid": "00002a25-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Hardware Revision String",
                  "uuid": "00002a27-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Software Revision String",
                  "uuid": "00002a28-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "System ID",
                  "uuid": "00002a23-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "PnP ID",
                  "uuid": "00002a50-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              }
          ]
      },
      {
          "name": "Firmware Service",
          "uuid": "00001530-0000-3512-2118-0009af100700",
          "characteristics": [
              {
                  "name": "Firmware",
                  "uuid": "00001531-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Firmware Data",
                  "uuid": "00001532-0000-3512-2118-0009af100700",
                  "properties": [{
                      "name": "WRITE_WITHOUT_RESPONSE"
                  }]
              }
          ]
      },
      {
          "name": "Alert Notification Service",
          "uuid": "00001811-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "New Alert",
                  "uuid": "00002a46-0000-1000-8000-00805f9b34fb",
                  "descriptor": {
                      "uuid": "00002901-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "WRITE"
                  }]
              },
              {
                  "name": "Alert Notification Control Point",
                  "uuid": "00002a44-0000-1000-8000-00805f9b34fb",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              }
          ]
      },
      {
          "name": "Immediate Alert Service",
          "uuid": "00001802-0000-1000-8000-00805f9b34fb",
          "characteristics": [{
              "name": "Alert Level",
              "uuid": "00002a06-0000-1000-8000-00805f9b34fb",
              "properties": [{
                  "name": "WRITE_WITHOUT_RESPONSE"
              }]
          }]
      },
      {
          "name": "Heart Rate Service",
          "uuid": "0000180d-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "Heart Rate Measurement",
                  "uuid": "00002a37-0000-1000-8000-00805f9b34fb",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "NOTIFY"
                  }]
              },
              {
                  "name": "Heart Rate Control Point",
                  "uuid": "00002a39-0000-1000-8000-00805f9b34fb",
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      }
                  ]
              }
          ]
      },
      {
          "name": "Mi Band Service",
          "uuid": "0000fee0-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "Current Time",
                  "uuid": "00002a2b-0000-1000-8000-00805f9b34fb",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Sensor Control",
                  "uuid": "00000001-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Sensor Data",
                  "uuid": "00000002-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "NOTIFY"
                  }]
              },
              {
                  "name": "Configuration",
                  "uuid": "00000003-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Peripheral Preferred Connection Parameters",
                  "uuid": "00002a04-0000-1000-8000-00805f9b34fb",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Fetch",
                  "uuid": "00000004-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Activity Data",
                  "uuid": "00000005-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "NOTIFY"
                  }]
              },
              {
                  "name": "Battery Info",
                  "uuid": "00000006-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Realtime Activity",
                  "uuid": "00000007-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "User settings",
                  "uuid": "00000008-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Device Event",
                  "uuid": "00000010-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "NOTIFY"
                  }]
              },
              {
                  "name": "Chunked Transfer",
                  "uuid": "00000020-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Weather",
                  "uuid": "0000000e-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002901-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [{
                      "name": "WRITE"
                  }]
              },
              {
                  "name": "Unknown F",
                  "uuid": "0000000f-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              }
          ]
      },
      {
          "name": "Authentication Service",
          "uuid": "0000fee1-0000-1000-8000-00805f9b34fb",
          "characteristics": [
              {
                  "name": "Authentication",
                  "uuid": "00000009-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE_WITHOUT_RESPONSE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              },
              {
                  "name": "Unknown_FEDD",
                  "uuid": "0000fedd-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "WRITE"
                  }]
              },
              {
                  "name": "Unknown_FEDE",
                  "uuid": "0000fede-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Unknown_FEDF",
                  "uuid": "0000fedf-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Unknown_FED0",
                  "uuid": "0000fed0-0000-1000-8000-00805f9b34fb",
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      }
                  ]
              },
              {
                  "name": "Unknown_FED1",
                  "uuid": "0000fed1-0000-1000-8000-00805f9b34fb",
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      }
                  ]
              },
              {
                  "name": "Unknown_FED2",
                  "uuid": "0000fed2-0000-1000-8000-00805f9b34fb",
                  "properties": [{
                      "name": "READ"
                  }]
              },
              {
                  "name": "Unknown_FED3",
                  "uuid": "0000fed3-0000-1000-8000-00805f9b34fb",
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      }
                  ]
              },
              {
                  "name": "Unknown_FEC1",
                  "uuid": "0000fec1-0000-3512-2118-0009af100700",
                  "descriptor": {
                      "uuid": "00002902-0000-1000-8000-00805f9b34fb"
                  },
                  "properties": [
                      {
                          "name": "READ"
                      },
                      {
                          "name": "WRITE"
                      },
                      {
                          "name": "NOTIFY"
                      }
                  ]
              }
          ]
      }
  ]`;
}

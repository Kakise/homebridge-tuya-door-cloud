import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { TuyaDoorPlatform } from './platform';
import {TuyaApi} from './tuyaContactSensor';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class TuyaDoor {
  private service: Service;

  // Tuya Door API object, used to interface with Tuya's own API
  private api = new TuyaApi(this.platform);

  constructor(
    private readonly platform: TuyaDoorPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Kakise') // me :)
      .setCharacteristic(this.platform.Characteristic.Model, 'Tuya Door Sensor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Tuya-Door-Homebridge');

    // Create a door service
    this.service = this.accessory.getService(this.platform.Service.Door) || this.accessory.addService(this.platform.Service.Door);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.display_name);

    // register handlers for the Door position and position state
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(this.handleCurrentPosition.bind(this));
    // Doors in Homekit are motorized door, here I force the TargetPosition to match the
    // current position and PositionState to 2, not moving
    this.service.getCharacteristic(this.platform.Characteristic.PositionState)
      .onGet(this.PositionState.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onGet(this.handleCurrentPosition.bind(this))
      .onSet(this.handleCurrentPosition.bind(this));

    // Update every 0.5 seconds
    setInterval(async () => {
      const state = await this.api.getDoorSensorStatus(this.accessory.context.device.device_id);

      // push the new value to HomeKit
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, state);

      this.platform.log.debug('Auto refreshing door state');
    }, 500);

  }

  async handleCurrentPosition(): Promise<CharacteristicValue> {
    // Check the door state, called on init and on HomeKit get update
    const state = await this.api.getDoorSensorStatus(this.accessory.context.device.device_id);
    return Number(state);
  }

  async PositionState(): Promise<CharacteristicValue> {
    return 2;
  }
}
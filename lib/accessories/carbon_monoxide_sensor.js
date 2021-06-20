import Device from '../device.js'
import { PanelDeviceType, EquipmentCode } from '../vivint_dictionary.json'

class CarbonMonoxideSensor extends Device {
  constructor(accessory, data, config, log, homebridge, vivintApi) {
    super(accessory, data, config, log, homebridge, vivintApi)
    this.service = accessory.getService(this.Service.CarbonMonoxideSensor)

    this.batteryService.updateCharacteristic(
      this.Characteristic.ChargingState,
      this.Characteristic.ChargingState.NOT_CHARGEABLE
    )

    this.service
      .getCharacteristic(this.Characteristic.CarbonMonoxideDetected)
      .on('get', (callback) => callback(null, this.getSensorState()))

    this.service
      .getCharacteristic(this.Characteristic.StatusTampered)
      .on('get', (callback) => callback(null, this.getTamperedState()))

    this.notify()
  }

  getSensorState() {
    if (Boolean(this.data.Status))
      return this.Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL
    else return this.Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL
  }

  notify() {
    super.notify()
    if (this.service) {
      this.service.updateCharacteristic(
        this.Characteristic.CarbonMonoxideDetected,
        this.getSensorState()
      )
      this.service.updateCharacteristic(
        this.Characteristic.StatusTampered,
        this.getTamperedState()
      )
    }
  }

  static appliesTo(data) {
    return (
      data.Type == PanelDeviceType.WirelessSensor &&
      (data.EquipmentCode == EquipmentCode.VS_CO3_DETECTOR ||
        data.EquipmentCode == EquipmentCode.EXISTING_CO ||
        data.EquipmentCode == EquipmentCode.CO1_CO_CANADA ||
        data.EquipmentCode == EquipmentCode.CO1_CO ||
        data.EquipmentCode == EquipmentCode.CO3_2GIG_CO ||
        data.EquipmentCode == EquipmentCode.CARBON_MONOXIDE_DETECTOR_345_MHZ ||
        data.EquipmentCode == EquipmentCode.VS_CO3_DETECTOR)
    )
  }

  static inferCategory(data, Accessory) {
    return Accessory.Categories.SENSOR
  }

  static addServices(accessory, Service) {
    super.addServices(accessory, Service)
    accessory.addService(
      new Service.CarbonMonoxideSensor(accessory.context.name)
    )
  }
}

export default CarbonMonoxideSensor

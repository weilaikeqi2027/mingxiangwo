class SmartWatch {
  constructor() {
    this.device = null;
    this.server = null;
    this.isConnected = false;
    this.heartRate = 0;
    this.steps = 0;
    this.calories = 0;
    this.listeners = [];
    this.updateInterval = null;
    this.simulationMode = false;
    this.simulationInterval = null;
  }

  onDataUpdate(callback) {
    this.listeners.push(callback);
  }

  emitDataUpdate() {
    const data = {
      heartRate: this.heartRate,
      steps: this.steps,
      calories: this.calories,
      isConnected: this.isConnected,
      timestamp: Date.now()
    };
    this.listeners.forEach(cb => cb(data));
  }

  async connect() {
    if (!navigator.bluetooth) {
      console.warn('Web Bluetooth 不支持，切换到模拟模式');
      this.startSimulation();
      return { success: true, simulated: true };
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate',
          '0000180d-0000-1000-8000-00805f9b34fb',
          '00001814-0000-1000-8000-00805f9b34fb',
          '00002a37-0000-1000-8000-00805f9b34fb',
          '00002a53-0000-1000-8000-00805f9b34fb',
          '00002a5b-0000-1000-8000-00805f9b34fb',
          '00002a9d-0000-1000-8000-00805f9b34fb',
          '00002a98-0000-1000-8000-00805f9b34fb',
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
          'fee0',
          'fee1',
          '180d',
          '181c'
        ]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.emitDataUpdate();
      });

      this.server = await this.device.gatt.connect();
      this.isConnected = true;

      await this.discoverServices();
      this.startDataUpdates();

      this.emitDataUpdate();
      return { success: true, simulated: false };
    } catch (error) {
      console.warn('蓝牙连接失败，切换到模拟模式:', error);
      this.startSimulation();
      return { success: true, simulated: true };
    }
  }

  async discoverServices() {
    if (!this.server) return;
    try {
      const services = await this.server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.notify || char.properties.indicate) {
            char.startNotifications();
            char.addEventListener('characteristicvaluechanged', (event) => {
              this.parseValue(service.uuid, char.uuid, event.target.value);
            });
          }
          if (char.properties.read) {
            try {
              const value = await char.readValue();
              this.parseValue(service.uuid, char.uuid, value);
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn('服务发现部分失败:', e);
    }
  }

  parseValue(serviceUuid, charUuid, dataView) {
    const s = serviceUuid.toLowerCase();
    const c = charUuid.toLowerCase();

    if (c.includes('2a37') || c.includes('heart_rate_measurement')) {
      const flags = dataView.getUint8(0);
      const hrFormat = flags & 0x01;
      this.heartRate = hrFormat ? dataView.getUint16(1, true) : dataView.getUint8(1);
    }

    if (c.includes('2a53') || c.includes('rsc_measurement')) {
      // 步数相关
    }

    if (c.includes('2a98') || c.includes('step_counter')) {
      this.steps = dataView.getUint32(0, true);
    }

    if (c.includes('2a9d') || c.includes('weight')) {
      // 体重相关
    }

    this.emitDataUpdate();
  }

  startDataUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(async () => {
      if (!this.server || !this.server.connected) {
        this.isConnected = false;
        this.emitDataUpdate();
        return;
      }
      try {
        const services = await this.server.getPrimaryServices();
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.read) {
              try {
                const value = await char.readValue();
                this.parseValue(service.uuid, char.uuid, value);
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }, 30000);
  }

  startSimulation() {
    this.simulationMode = true;
    this.isConnected = true;
    this.steps = Math.floor(3000 + Math.random() * 8000);
    this.calories = Math.floor(80 + Math.random() * 400);
    this.heartRate = Math.floor(60 + Math.random() * 40);

    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      this.steps += Math.floor(Math.random() * 50);
      this.calories += Math.floor(Math.random() * 5);
      this.heartRate = Math.max(50, Math.min(180, this.heartRate + Math.floor(Math.random() * 10 - 5)));
      this.emitDataUpdate();
    }, 30000);

    this.emitDataUpdate();
  }

  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.server) {
      this.server.disconnect();
      this.server = null;
    }
    this.device = null;
    this.isConnected = false;
    this.simulationMode = false;
    this.emitDataUpdate();
  }

  getData() {
    return {
      heartRate: this.heartRate,
      steps: this.steps,
      calories: this.calories,
      isConnected: this.isConnected,
      isSimulated: this.simulationMode
    };
  }
}

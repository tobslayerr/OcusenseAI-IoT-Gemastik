import { create } from 'zustand';
import mqtt, { MqttClient } from 'mqtt';
import { OcusensePayload } from '@/types';

interface MqttState {
  client: MqttClient | null;
  isConnected: boolean;
  battery: number;
  latency: number;
  latestScan: OcusensePayload | null;
  connect: () => void;
  disconnect: () => void;
}

export const useMqttStore = create<MqttState>((set, get) => ({
  client: null,
  isConnected: false,
  battery: 0,
  latency: 0,
  latestScan: null,

  connect: () => {
    // Mencegah koneksi ganda jika sudah terhubung
    if (get().client) return;

    // Menghubungkan via WebSockets ke Pialang Mosquitto Lokal
    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
      set({ isConnected: true, client });
      // Berlangganan ke dua topik utama
      client.subscribe('ocusense/telemetry');
      client.subscribe('ocusense/scans');
      console.log('✅ WebSockets MQTT Terhubung ke Dasbor');
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (topic === 'ocusense/telemetry') {
          // Pembaruan data perangkat keras secara langsung (Live)
          set({ battery: data.battery_percentage, latency: data.latency_ms });
        } 
        else if (topic === 'ocusense/scans') {
          // Pembaruan data saat ada hasil pemindaian AI yang masuk
          set({ 
            latestScan: data as OcusensePayload,
            battery: data.device_metrics.battery_percentage,
            latency: data.device_metrics.latency_ms
          });
        }
      } catch (error) {
        console.error('Gagal memproses pesan MQTT:', error);
      }
    });

    client.on('close', () => set({ isConnected: false }));
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.end();
      set({ client: null, isConnected: false });
    }
  },
}));
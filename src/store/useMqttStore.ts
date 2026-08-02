/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import mqtt from 'mqtt';

interface MqttState {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  battery: number;
  latency: number;
  latestScanPayload: any | null; // 🟢 Menyimpan data scan real-time
  connect: () => void;
  disconnect: () => void;
  clearLatestScan: () => void;   // 🟢 Fungsi untuk menghapus scan dari layar
}

export const useMqttStore = create<MqttState>((set, get) => ({
  client: null,
  isConnected: false,
  battery: 0,
  latency: 0,
  latestScanPayload: null,
  clearLatestScan: () => set({ latestScanPayload: null }),
  
  connect: () => {
    const currentClient = get().client;
    // Cegah duplikasi koneksi
    if (currentClient && currentClient.connected) return;

    const client = mqtt.connect('ws://localhost:9001', {
      clientId: 'ocusense_web_' + Math.random().toString(16).substring(2, 10),
      reconnectPeriod: 1000,
      keepalive: 60
    });

    client.on('connect', () => {
      set({ isConnected: true, client });
      // Dengarkan Baterai & Hasil Scan secara bersamaan!
      client.subscribe('ocusense/telemetry');
      client.subscribe('ocusense/scans'); 
    });

    client.on('message', (topic, message) => {
      if (topic === 'ocusense/telemetry') {
        try {
          const data = JSON.parse(message.toString());
          set({ battery: data.battery_percentage, latency: data.latency_ms });
        } catch (e) {}
      }
      
      // 🟢 TANGKAP HASIL SCAN SECARA REAL-TIME
      if (topic === 'ocusense/scans') {
        try {
          const data = JSON.parse(message.toString());
          set({ latestScanPayload: data });
        } catch (e) {}
      }
    });

    client.on('offline', () => set({ isConnected: false }));
    client.on('close', () => set({ isConnected: false }));
    client.on('error', () => set({ isConnected: false }));
  },
  
  disconnect: () => {
    const { client } = get();
    if (client) {
      client.end();
      set({ client: null, isConnected: false });
    }
  }
}));
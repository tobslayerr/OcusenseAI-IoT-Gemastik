import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime, timezone

BROKER = "localhost"
PORT = 1883
TOPIC_TELEMETRY = "ocusense/telemetry"
TOPIC_SCANS = "ocusense/scans"

client = mqtt.Client(client_id="RaspberryPi_Simulator", protocol=mqtt.MQTTv311)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Terhubung ke Mosquitto MQTT Broker (TCP 1883)")
    else:
        print(f"❌ Gagal terhubung, kode rc={rc}")

client.on_connect = on_connect
client.connect(BROKER, PORT, 60)
client.loop_start()

try:
    print("Menjalankan Simulasi Telemetri Alat (Tekan Ctrl+C untuk berhenti)...")
    battery = 100.0
    scan_count = 1
    
    while True:
        # 1. Kirim Data Baterai & Latensi secara Live (Setiap 2 detik)
        battery = max(0, battery - random.uniform(0.1, 0.3))
        latency = round(random.uniform(5.5, 7.2), 1)
        
        telemetry_data = {
            "battery_percentage": round(battery, 1),
            "latency_ms": latency
        }
        client.publish(TOPIC_TELEMETRY, json.dumps(telemetry_data))
        print(f"📡 Telemetri dikirim: Baterai {round(battery,1)}% | Latensi {latency}ms")
        
        # 2. Simulasi Menekan Tombol Scan / Hasil AI Keluar (Setiap 10 detik)
        if scan_count % 5 == 0: # 5 * 2 detik = 10 detik
            now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            scan_id = f"SCN-2026-{random.randint(1000, 9999)}"
            
            payload = {
                "scan_id": scan_id,
                "timestamp": now_iso,
                "device_metrics": telemetry_data,
                "ai_analysis": {
                    "diagnosis": random.choice(["Katarak Matur", "Katarak Imatur", "Mata Normal"]),
                    "confidence_score": round(random.uniform(85.0, 99.5), 2),
                    "bounding_box": [120, 50, 310, 220]
                }
            }
            client.publish(TOPIC_SCANS, json.dumps(payload))
            print(f"🔥 [SCAN DIKIRIM] Hasil YOLOv8 & CNN untuk {scan_id} berhasil dikirim!")
            
        scan_count += 1
        time.sleep(2)

except KeyboardInterrupt:
    print("\n🛑 Simulasi Dihentikan.")
    client.loop_stop()
    client.disconnect()
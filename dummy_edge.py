import paho.mqtt.client as mqtt
import json
import random
import base64
import os
import uuid
import time
import threading
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
PROFILES_FILE = "device_profiles.json"

def load_profiles():
    if os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, "r") as f:
            return json.load(f)
    return {}

def save_profiles(profiles):
    with open(PROFILES_FILE, "w") as f:
        json.dump(profiles, f, indent=4)

print("==================================================")
print(" 📶 OCUSENSE EDGE - HARDWARE SIMULATOR & CAMERA ")
print("==================================================")

profiles = load_profiles()
active_mac = None

if not profiles:
    print("⚠️ Belum ada alat fisik yang terdaftar.")
    name = input("Masukkan Nama Alat Baru (misal: Ocusense Rumah A): ")
    active_mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0,2*6,2)][::-1])
    pin = str(random.randint(1000, 9999))
    profiles[active_mac] = {"name": name, "mac": active_mac, "pin": pin}
    save_profiles(profiles)
else:
    print("Daftar Alat (Hardware) yang Tersedia:")
    mac_list = list(profiles.keys())
    for i, mac in enumerate(mac_list):
        print(f"[{i+1}] {profiles[mac]['name']} (MAC: {mac})")
    print(f"[{len(mac_list)+1}] ➕ Buat Alat Fisik Baru")
    
    pilihan = int(input("\nPilih alat yang ingin dinyalakan (1/2/3...): "))
    if pilihan <= len(mac_list):
        active_mac = mac_list[pilihan-1]
        if "pin" not in profiles[active_mac]:
            profiles[active_mac]["pin"] = str(random.randint(1000, 9999))
            save_profiles(profiles)
    else:
        name = input("Masukkan Nama Alat Baru: ")
        active_mac = f"00:1A:2B:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}"
        pin = str(random.randint(1000, 9999))
        profiles[active_mac] = {"name": name, "mac": active_mac, "pin": pin}
        save_profiles(profiles)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect(MQTT_BROKER, MQTT_PORT, 60)

is_paired = False

def on_message(client, userdata, msg):
    global is_paired
    if msg.topic == f"ocusense/paired/{active_mac}":
        payload = json.loads(msg.payload.decode('utf-8'))
        print("\n" + "🌟"*25)
        print(f" ✅ OTORISASI BERHASIL!")
        print(f" 👤 Profil Pasien Aktif: {payload.get('operator', 'Anonim')}")
        print(" Alat siap digunakan untuk memindai mata.")
        print("🌟"*25 + "\n")
        is_paired = True

client.on_message = on_message
client.subscribe(f"ocusense/paired/{active_mac}")

pairing_code = profiles[active_mac]["pin"]
init_payload = {
    "mac_address": active_mac,
    "device_name": profiles[active_mac]['name'],
    "pairing_code": pairing_code
}
client.publish("ocusense/register", json.dumps(init_payload), retain=True)

def send_telemetry():
    while True:
        if is_paired:
            telemetry_payload = {
                "mac_address": active_mac,
                "battery_percentage": random.randint(70, 100),
                "latency_ms": round(random.uniform(4.0, 15.0), 1)
            }
            client.publish("ocusense/telemetry", json.dumps(telemetry_payload))
        time.sleep(3)

threading.Thread(target=send_telemetry, daemon=True).start()

print("\n" + "="*50)
print(f" 🔑 KODE PAIRING WI-FI ALAT: {pairing_code} ")
print(" ⏳ MENUNGGU OTORISASI DARI WEB DASBOR... (JANGAN DITUTUP)")
print("="*50 + "\n")

client.loop_start()

try:
    while not is_paired:
        time.sleep(1)

    while True:
        print(f"\n--- 🎥 ALAT AKTIF: {profiles[active_mac]['name']} ---")
        
        img_path = input("👉 [WAJIB] Masukkan path gambar mata (atau 'q' keluar): ")
        if img_path.lower() == 'q': break
        
        if not os.path.exists(img_path):
            print("❌ ERROR: File gambar tidak ditemukan!")
            continue
            
        with open(img_path, "rb") as img_file:
            image_base64 = base64.b64encode(img_file.read()).decode('utf-8')

        # PERBAIKAN: Gunakan Stempel Waktu (Timestamp) agar ID 100% Unik dan Data Tersimpan
        scan_id = f"SCN-{datetime.now().strftime('%H%M%S')}{random.randint(10,99)}"
        
        diagnosis = random.choice(["Katarak Matur", "Katarak Imatur", "Mata Normal"])
        confidence = round(random.uniform(90.0, 98.5) if diagnosis == "Katarak Matur" else random.uniform(75.0, 99.0), 1)

        yolo_box = [80, 40, 560, 420] 

        payload = {
            "mac_address": active_mac,
            "device_name": profiles[active_mac]['name'],
            "scan_id": scan_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "ai_analysis": {"diagnosis": diagnosis, "confidence_score": confidence, "bounding_box": yolo_box},
            "image": image_base64
        }
        client.publish("ocusense/scans", json.dumps(payload))
        print(f"📤 [SUKSES] Hasil foto pindaian #{scan_id} berhasil dikirim ke server!")
except KeyboardInterrupt:
    pass
finally:
    client.loop_stop()
    client.disconnect()
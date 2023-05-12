# serverside_mirocle

serverside_mirocle merupakan project javascript dari alat terapi sepeda cermin berbasis iot.

langkah penginstalan
1. install node js di local server atau server 
2. sesuaikan database dari localhost maupun server 
3. install depedensi mqtt dan mysql 
  npm install mqtt
  npm install mysql
4. tinggal jalankan saja scriptnya melalui node js 
  node <nama file.js>

# konteks: minta info pasien
- publisher: alat 
- topik: data_request
- format pesan: 
{
    "request_time": 757233,
    "device_id": "mirocle_001",
    "request_type": "info_pasien"
}
  
FORMAT PESAN PENGIRIMAN 

# konteks: balas permintaan info pasien
- publisher: server
- topik: data_reply
- format pesan:
{
  "device_id": [seri_alat],
  "reply_type": [tipe_balasan],
  "request_time": [waktu_permintaan],
  "nama": [nama_pasien],
  "jenis_kelamin": [jenis_kelamin],
  "berat_badan": [berat_badan_pasien],
  "usia": [usia_pasien]
}
- contoh pesan:
{
  "device_id": "mirocle_001",
  "reply_type": "info_pasien",
  "request_time": 9320080,
  "nama": "Yanwardo",
  "jenis_kelamin": 1,
  "berat_badan": 55,
  "usia": 40
}

# koneks: kirim info mulai terapi
- publisher: alat
- format topik: terapi_begin 
- contoh topik: terapi_begin
- format pesan: 
{
    "seri_alat": [seri_alat],
    "id_terapi": [unixtime]
}
- contoh pesan: 
{
    "seri_alat": "mirocle_001",
    "id_terapi": 1683696600
}

# konteks: kirim data terapi
- publisher: alat
- format topik: data_terapi/[id_terapi]
- contoh topik: data_terapi/1683696600
- format pesan: 
{
    "detakJantung":[nilai],
    "jumlahDetakJantung":[nilai],
    "saturasiOksigen":[nilai],
    "kalori":[nilai],
    "putaranPedal":[nilai]
}
- contoh pesan:
{
    "detakJantung":0,
    "jumlahDetakJantung":0,
    "saturasiOksigen":0,
    "kalori":33.79529953,
    "putaranPedal":0
}

# konteks: kirim data final terapi
- publisher: alat
- format topik: terapi_end
- contoh topik: terapi_end
- format pesan: 
{
   "id_terapi": 1683698400,
    "waktu_mulai": 1683696600,
    "waktu_selesai": 1683696600,
    "durasi":[nilai],
    "detakJantungRataRata":[nilai],
    "kaloriTotal":[nilai],
    "putaranPedal":[nilai]
}
- contoh pesan:
{
    "id_terapi": 1683698400,
    "waktu_mulai": 1683696600,
    "waktu_selesai": 1683696600,
    "durasi":898
    "detakJantungRataRata":399,
    "kaloriTotal":898,
    "putaranPedal":898
}

# Cara penggunaan pada sistem website dan server (untuk data_terapi.js)
1. siapkan aplikasi mqttx dan mqtt exploler 
setingan broker
server    : mqttx://broker.emqx.io
port      : 1883
username  : mirocle
password  : 123
  
setingan broker mqttx (sama)
![image.png]( {https://drive.google.com/open?id=1GlYjv7AM-e1egDJDdaknwsF6xVNIozOg&authuser=taelektro9%40gmail.com&usp=drive_fs} )
  
setingan broker mqtt explorer (sama)
![image.png]({https://drive.google.com/open?id=1GlRBu3NXP3wDZp3QSxwMpc0sQ2Cm_w8p&authuser=taelektro9%40gmail.com&usp=drive_fs})
  
setingan subscriber di mqtt explorer 
![image.png]({https://drive.google.com/open?id=1GlRBu3NXP3wDZp3QSxwMpc0sQ2Cm_w8p&authuser=taelektro9%40gmail.com&usp=drive_fs})
  
2. jalankan file data_terapi.js di terminal dengan perintah 
$node data_terapi.js
  
3. buka mqttx dan hubungkan ke broker lalu kirim pesan ke topik terapi_begin dengan format pesan 
# koneks: kirim info mulai terapi
  
- publisher: alat
- format topik: terapi_begin 
- contoh topik: terapi_begin
- format pesan: 
{
    "seri_alat": [seri_alat],
    "id_terapi": [unixtime]
}
- contoh pesan: 
{
    "seri_alat": "mirocle_001",
    "id_terapi": 1683696600
}

![image.png]({https://drive.google.com/open?id=1GlvFYLpF8b2TDJYy9GsLXxwnoKqx5T_3&authuser=taelektro9%40gmail.com&usp=drive_fs})
  
sembari lihat terminal, isi pesannya apa dari server node js

4. setelah itu buka mqtt explorer untuk mengirimkan data pesan sesuai dengan format 

# konteks: kirim data terapi
- publisher: alat
- format topik: data_terapi/[id_terapi]
- contoh topik: data_terapi/1683696600
- format pesan: 
{
    "detakJantung":[nilai],
    "jumlahDetakJantung":[nilai],
    "saturasiOksigen":[nilai],
    "kalori":[nilai],
    "putaranPedal":[nilai]
}
- contoh pesan:
{
    "detakJantung":0,
    "jumlahDetakJantung":0,
    "saturasiOksigen":0,
    "kalori":33.79529953,
    "putaranPedal":0
}

contoh 
![image.png]({https://drive.google.com/open?id=1GmEt5TBAJQxCCYgM2r653c8tdnD2p20h&authuser=taelektro9%40gmail.com&usp=drive_fs})
  
5. kalau pengiriman data sensor sudah selesai lakukan pengiriman lagi bisa di mqttx atau mqtt explorer sesuai format berikut ini 
  
# konteks: kirim data final terapi
- publisher: alat
- format topik: terapi_end
- contoh topik: terapi_end
- format pesan: 
{
   "id_terapi": 1683698400,
    "waktu_mulai": 1683696600,
    "waktu_selesai": 1683696600,
    "durasi":[nilai],
    "detakJantungRataRata":[nilai],
    "kaloriTotal":[nilai],
    "putaranPedal":[nilai]
}
- contoh pesan:
{
    "id_terapi": 1683698400,
    "waktu_mulai": 1683696600,
    "waktu_selesai": 1683696600,
    "durasi":898
    "detakJantungRataRata":399,
    "kaloriTotal":898,
    "putaranPedal":898
}
  

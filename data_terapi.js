const mqtt = require("mqtt");
const mysql = require("mysql");

const MQTT_BROKER = "mqtt://broker.emqx.io";
const MQTT_USERNAME = "mirocle";
const MQTT_PASSWORD = "123";
const MQTT_PORT = 1883;

const client = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  port: MQTT_PORT,
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mirocle",
});

db.connect((err) => {
  if (err) {
    console.log("Koneksi ke database gagal");
    throw err;
  }
  console.log("Terhubung ke database");
});

client.on("connect", () => {
  console.log("Terhubung ke broker MQTT");
  client.subscribe("terapi_begin");
  client.subscribe("terapi_data/#");
  client.subscribe("terapi_end");
});

let id_terapi;

client.on("message", (topic, message) => {
  if (topic == "terapi_begin") {
    const data = JSON.parse(message);
    id_terapi = data.id_terapi;
    console.log(`Menerima data terapi baru dengan id: ${id_terapi}`);
    waktu = new Date(id_terapi * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi baru dengan id: ${id_terapi} pada waktu: ${waktu}`
    );
  } else if (topic == `terapi_data/${id_terapi}`) {
    const data = JSON.parse(message);
    console.log(`Menerima data terapi untuk id: ${id_terapi}`);
    // Lakukan sesuatu dengan data yang diterima
    const query = `
      INSERT INTO sensor_data (detak_jantung, jumlah_detak_jantung, saturasi_oksigen, kalori, putaran_pedal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      data.detakJantung,
      data.jumlahDetakJantung,
      data.saturasiOksigen,
      data.kalori,
      data.putaranPedal,
    ];
    db.query(query, values, (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Data berhasil dimasukkan ke dalam tabel sensor_data");
      }
    });
  } else if (topic == `terapi_end`) {
    const data = JSON.parse(message);
    waktu_mulai = data.waktu_mulai;
    console.log(`Menerima data terapi final dengan id: ${id_terapi}`);
    waktu_mulai = new Date(waktu_mulai * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi final dengan id: ${id_terapi} pada waktu: ${waktu_mulai}`
    );

    waktu_selesai = data.waktu_selesai;
    console.log(`Menerima data terapi final dengan id: ${id_terapi}`);
    waktu_selesai = new Date(waktu_selesai * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi final dengan id: ${id_terapi} pada waktu: ${waktu_selesai}`
    );

    const query = `
      INSERT INTO sensor_data_final (id_terapi, waktu_mulai, waktu_selesai, rata_rata_detak_jantung, kalori_total, putaran_pedal, durasi)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id_terapi,
      waktu_mulai,
      waktu_selesai,
      data.detakJantungRataRata,
      data.kaloriTotal,
      data.putaranPedal,
      data.durasi,
    ];

    db.query(query, values, (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Data berhasil dimasukkan ke dalam tabel info_terapi");
      }
    });
  }
});

client.on("close", () => {
  console.log("Koneksi ke broker MQTT terputus");
});

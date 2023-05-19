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
  qos: 0,
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mirocle123-",
  database: "iot-mirocle",
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
  client.subscribe("terapi_begin", { qos: 0 });
  client.subscribe("terapi_data/#", { qos: 0 });
  client.subscribe("terapi_end", { qos: 0 });
});

let id_terapi;
let device_id;

client.on("message", (topic, message) => {
  if (topic == "terapi_begin") {
    const data = JSON.parse(message);
    id_terapi = data.id_terapi;
    device_id = data.device_id;
    console.log(`Menerima data terapi baru dengan id: ${id_terapi}`);
    waktu = new Date(id_terapi * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi baru dengan id: ${id_terapi} pada waktu: ${waktu} dengan device id = ${device_id}`
    );
  } else if (topic === `terapi_data/${id_terapi}`) {
    const data = JSON.parse(message);
    console.log(`Menerima data terapi untuk id: ${id_terapi}`);

    // Periksa keberadaan device_id dalam tabel users
    const checkDeviceQuery = `SELECT id AS user_id, device_id FROM users WHERE device_id = ?`;
    db.query(checkDeviceQuery, [device_id], (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
        if (results.length === 0) {
          console.log("Device ID tidak valid");
        } else {
          const device_id = results[0].device_id;
          const user_id = results[0].user_id;
          console.log(`Device ID ditemukan: ${device_id}`);
          console.log(`User ID yang terkait: ${user_id}`);

          // Lanjutkan operasi INSERT ke tabel sensor_data
          const query = `
          INSERT INTO sensor_data (user_id, detak_jantung, durasi, saturasi_oksigen, kalori, putaran_pedal)
          SELECT id, ?, ?, ?, ?, ? FROM users WHERE device_id = ?
          `;
          const values = [
            data.detakJantung,
            data.durasi,
            data.saturasiOksigen,
            data.kalori,
            data.putaranPedal,
            device_id, // Ubah menjadi device_id
          ];
          db.query(query, values, (error, results, fields) => {
            if (error) {
              console.log(error);
            } else {
              console.log(
                "Data berhasil dimasukkan ke dalam tabel sensor_data"
              );
            }
          });
        }
      }
    });
  } else if (topic == `terapi_end`) {
    const data = JSON.parse(message);
    console.log(`Menerima data terapi final dengan id: ${id_terapi}`);
    const waktu_mulai = new Date(data.waktu_mulai * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi final dengan id: ${id_terapi} pada waktu mulai: ${waktu_mulai}`
    );

    const waktu_selesai = new Date(data.waktu_selesai * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      `Menerima data terapi final dengan id: ${id_terapi} pada waktu selesai: ${waktu_selesai}`
    );

    // Periksa keberadaan device_id dalam tabel users
    const checkDeviceQuery = `SELECT id AS user_id, device_id FROM users WHERE device_id = ?`;
    db.query(checkDeviceQuery, [device_id], (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
        if (results.length === 0) {
          console.log("Device ID tidak valid");
        } else {
          const device_id = results[0].device_id;
          const user_id = results[0].user_id;
          console.log(`Device ID ditemukan: ${device_id}`);
          console.log(`User ID yang terkait: ${user_id}`);

          // Lanjutkan operasi INSERT ke tabel sensor_data_final
          const query = `
            INSERT INTO sensor_data_final (user_id, id_terapi, waktu_mulai, waktu_selesai, rata_rata_detak_jantung, rata_rata_saturasi_oksigen, kalori_total, putaran_pedal, durasi)
            SELECT id, ?, ?, ?, ?, ?, ?, ?, ? FROM users WHERE device_id = ?
          `;
          const values = [
            id_terapi,
            waktu_mulai,
            waktu_selesai,
            data.detakJantungRataRata,
            data.rataRataSaturasiOksigen,
            data.kaloriTotal,
            data.putaranPedal,
            data.durasi,
            device_id, // Ubah menjadi device_id
          ];
          db.query(query, values, (error, results, fields) => {
            if (error) {
              console.log(error);
            } else {
              console.log(
                "Data berhasil dimasukkan ke dalam tabel sensor_data_final"
              );
            }
          });
        }
      }
    });
  }
});

client.on("close", () => {
  console.log("Koneksi ke broker MQTT terputus");
});

const mqtt = require("mqtt");
const mysql = require("mysql");

// Konfigurasi koneksi MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Mirocle123-",
  database: "iot-mirocle",
};

// Buat koneksi ke MySQL
const connection = mysql.createConnection(dbConfig);

// Koneksi ke MQTT broker
const mqttClient = mqtt.connect("mqtt://broker.emqx.io:1883", {
  username: "mirocle",
  password: "123",
  qos: 0,
});

mqttClient.on("connect", () => {
  console.log("Terhubung ke MQTT broker.");

  // Subscribe ke topik yang diinginkan
  mqttClient.subscribe("data_request", { qos: 0 }, (err) => {
    if (err) {
      console.error("Gagal subscribe ke topik:", err);
    } else {
      console.log("Berhasil subscribe ke topik.");
    }
  });
});

// Ketika menerima pesan dari topik yang disubscribe
mqttClient.on("message", (topic, message) => {
  console.log(`Pesan diterima dari topik "${topic}": ${message.toString()}`);

  // Parse pesan JSON
  const parsedMessage = JSON.parse(message.toString());

  // Cek apakah pesan memiliki request_time, device_id, dan request_type
  if (
    parsedMessage.hasOwnProperty("request_time") &&
    parsedMessage.hasOwnProperty("device_id") &&
    parsedMessage.hasOwnProperty("request_type")
  ) {
    // Jika request_type adalah 'info_pasien'
    if (parsedMessage.request_type === "info_pasien") {
      // Query untuk mencari info_pasien berdasarkan device_id
      const query =
        "SELECT u.name, p.jenis_kelamin, p.berat_badan, p.umur AS usia " +
        "FROM users AS u " +
        "JOIN profiles AS p ON u.id = p.user_id " +
        "WHERE u.device_id = ?";

      // const query = "SELECT * FROM profiles WHERE device_id = ?";
      connection.query(query, [parsedMessage.device_id], (err, result) => {
        if (err) {
          console.error("Gagal mengambil data dari MySQL:", err);
        } else {
          // Jika data ditemukan
          if (result.length > 0) {
            const data = {
              device_id: parsedMessage.device_id,
              reply_type: "info_pasien",
              request_time: parsedMessage.request_time,
              nama: result[0].name,
              jenis_kelamin: result[0].jenis_kelamin,
              berat_badan: result[0].berat_badan,
              usia: result[0].usia,
            };
            console.log("Data ditemukan:", data);

            // Kirim data kembali ke perangkat melalui MQTT
            mqttClient.publish("data_reply", JSON.stringify(data), { qos: 0 });
          } else {
            console.log("Data tidak ditemukan.");
          }
        }
      });
    }
  }
});

// Tangani error koneksi MQTT
mqttClient.on("error", (err) => {
  console.error("Terjadi error pada koneksi MQTT:", err);
});

// Tangani koneksi MySQL error
connection.connect((err) => {
  if (err) {
    console.error("Terjadi error pada koneksi MySQL:", err);
  } else {
    console.log("Terhubung ke MySQL.");
  }
});

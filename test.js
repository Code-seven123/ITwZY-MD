// Dalam satu file, misalnya main.js

// Fungsi async untuk menunggu sampai variabel bernilai "finish"
async function waitForFinish(variable, isi) {
  return new Promise(resolve => {
    const handler = {
      set(target, key, value) {
        target[key] = value;
        if (key === "value" && value === isi) {
          resolve();
        }
        return true;
      }
    };

    const proxyVariable = new Proxy(variable, handler);

    // Menunggu sampai variabel memiliki nilai "finish"
    (function checkFinish() {
      if (proxyVariable.value !== isi) {
        setTimeout(checkFinish, 1000);
      }
    })();
  });
}

// Contoh penggunaan
const myVariable = { value: "not finished" }; // Gunakan const untuk mencegah perubahan referensi

// Panggil fungsi waitForFinish dengan variabel Anda sebagai argumen
waitForFinish(myVariable, 'finish').then(() => {
  console.log("Variabel telah mencapai nilai 'finish'");
})

// Kemudian, di suatu tempat dalam kode Anda, ubah nilai properti variabel menjadi "finish"
setTimeout(() => {
  myVariable.value = "finish";
}, 5000); // Mengubah nilainya menjadi "finish" setelah 5 detik

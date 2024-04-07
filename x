// Fungsi untuk menunggu variabel sampai bernilai "finish"
async function waitForFinish(variable) {
  while (variable !== "finish") {
    // Menunggu 1 detik sebelum memeriksa kembali variabel
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("Variabel telah mencapai nilai 'finish'");
}

// Contoh penggunaan
let myVariable = "not finished";

// Panggil fungsi waitForFinish dengan variabel Anda sebagai argumen
waitForFinish(myVariable);

// Kemudian, di suatu tempat dalam kode Anda, ubah nilai variabel menjadi "finish"
myVariable = "finish";

import client from './aws.js'
import { GetObjectCommand, ListObjectsCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import chokidar from 'chokidar'
import { Upload } from "@aws-sdk/lib-storage";
import * as fs from 'fs'

const targetPath = './sessions'
const watcher = chokidar.watch(targetPath, {
  persistent: true, // Pemantauan terus berlanjut, bahkan setelah skrip selesai
  ignored: /(^|[/\\])\../, // Hindari file tersembunyi
  ignoreInitial: false, // Jangan abaikan perubahan awal
})
const ev = async (type, path) => {
  if(type == 'add'){
    try {
       const cmd = new PutObjectCommand({
         Bucket: "mybucketmanurea",
         Key: `session-itwzy/${path.split('/').slice(-1)[0]}`,
         body: fs.createReadStream(path)
       })
       const response = await client.send(cmd)
/*       const parallelUploads3 = new Upload({
         client: client,
         params: {
           Bucket: "mybucketmanurea",
           Key: `session-itwzy/${path.split('/').slice(-1)[0]}`,
           body: path
         },
       })
       parallelUploads3.on("httpUploadProgress", (progress) => {
         console.log(progress);
       });

       await parallelUploads3.done();*/
       console.log('sukses')
    } catch (e) {
      console.error(e)
    }
  } else if(type == 'unlink'){
    try {
      const cmd = new DeleteObjectCommand({
        Bucket: "mybucketmanurea",
        Key: `session-itwzy/${path.split('/').slice(-1)[0]}`,
      })
      const response = await client.send(cmd);
      console.log(`session-itwzy/${path.split('/').slice(-1)[0]}`)
    } catch (e) {
      console.log('error')
    }
  } else {
    console.log('error')
  }
try {
  const listObject = new ListObjectsCommand({
    Bucket: "mybucketmanurea",
    Key: "session-itwzy/"
  })
  const dataLists = await client.send(listObject);
  console.log(dataLists.Contents)
} catch (e) {
  console.error(e)
}
}

watcher.on('change', (path) => {
  console.log(`File ${path} telah diubah`);
  ev('unlink', path)
  ev('add', path)
  // Lakukan tindakan yang diperlukan ketika terjadi perubahan
});

// Tambahkan event listener untuk penambahan file
watcher.on('add', (path) => {
  console.log(`File ${path} telah ditambahkan`);
  ev('add', path)
  // Lakukan tindakan yang diperlukan ketika file ditambahkan
});
watcher.on('unlink', (path) => {
  console.log(`File ${path} telah dihapus`);
  ev('unlink', path)
  // Lakukan tindakan yang diperlukan ketika file dihapus
});

// Tangani event error jika ada
watcher.on('error', (error) => {
  console.error(`Error: ${error}`);
});
export default async () => {
try {
  const listObject = new ListObjectsCommand({
    Bucket: "mybucketmanurea",
    Key: "session-itwzy/"
  })
  const dataLists = await client.send(listObject);
  console.log(dataLists.Contents)
  } catch (e) {
    console.error(e)
  }
}

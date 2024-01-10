import client from './lib/aws.js'
import { GetObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3'
import { writeFile } from 'node:fs/promises'
try{
  const params = {
    Bucket: "mybucketmanurea",
    Key: "session-itwzy"
  };
  const lists = new ListObjectsCommand({ Bucket: "mybucketmanurea" })
  const { Contents } = await client.send(lists)
  for ( const list of Contents.slice(1) ) {
    const cmd = new GetObjectCommand({
      Bucket: "mybucketmanurea",
      Key: list.Key
    })
    const { Body } = await client.send(cmd)
    const path = `sessions/${list.Key.split('/').slice(1).join('/')}`
    console.log(list.Key.split('/').slice(1).join('/'))
    await writeFile(path, Body)
  }
} catch (e) {
  console.error(e)
}

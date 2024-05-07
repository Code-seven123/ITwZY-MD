import { exec } from "child_process"

async function runExec(cmd){
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if(error){
        reject(error)
        return
      }
      if(stderr){
        reject(new Error(stderr))
        return
      }
      resolve(stdout)
    })
  })
}
export {
  runExec
}

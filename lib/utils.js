import { spawn } from 'child_process'

async function cute1(com, args){
  return new Promise((reject, resolve) => {
    const command = spawn(com, args)

    command.stdout.on('data', (data) => {
      resolve(`Stdout: ${data}`)
    })

    command.stderr.on('data', (data) => {
      resolve(`Stderr: ${data}`)
    })
		
    command.on('error', (err) => {
      reject(`error spawning command ${com}, from error ${err}`)
    })
	  command.on('close', (code) => {
      resolve(`Spawn exited from ${code}`)
	  })
  })
}


export default {
  cute1
}

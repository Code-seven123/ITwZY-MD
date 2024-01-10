import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs'
import os from 'os'

const __filename = function filename(pathURL = import.meta, rmPrefix = os.platform() !== 'win32') {
    const path = /** @type {ImportMeta} */ (pathURL).url || /** @type {String} */ (pathURL)
    return rmPrefix ?
        /file:\/\/\//.test(path) ?
            fileURLToPath(path) :
            path : /file:\/\/\//.test(path) ?
            path : pathToFileURL(path).href
}
export default async function importLoader(module) {
    // return new Promise((resolve, reject) => {
    //     const worker = new Worker(new URL(WORKER_FILE), {
    //         workerData: module
    //     })
    //     const killWorker = () => worker.terminate().catch(() => { })
    //     worker.once('message', (msg) => (killWorker(), console.log(msg.data), resolve(msg)))
    //     worker.once('error', (error) => (killWorker(), reject(error)))
    // })
    module = __filename(module)
    const module_ = await import(`${module}?id=${Date.now()}`)
    const result = module_ && 'default' in module_ ? module_.default : module_
    return result
}

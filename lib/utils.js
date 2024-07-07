import { fileURLToPath } from "url"
import { dirname } from "path"
import moment from "moment-timezone"
import { timeZone } from "./config.js"
import { exec, spawn } from "child_process"
import { curve } from "libsignal-node"
import { randomBytes, randomUUID } from "crypto"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const delay = async ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

function run(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`)
      return
    }
    console.log(`Stdout: ${stdout}`)
  })
}

async function getUptime() {
  return new Promise((resolve, reject) => {
    const uptimeProcess = spawn("uptime", ["-p"])

    let uptimeData = ""

    uptimeProcess.stdout.on("data", data => {
      uptimeData += data.toString()
    })

    uptimeProcess.stderr.on("data", data => {
      reject(`Error: ${data}`)
    })

    uptimeProcess.on("close", code => {
      if (code === 0) {
        resolve(uptimeData)
      } else {
        reject(`Child process exited with code ${code}`)
      }
    })
  })
}

function frontText(text) {
  return text.replace(/(?:^|[\.\?!]\s*)([a-z])/g, (match, char) => {
    return char.toUpperCase()
  })
}

async function wait(variable, isi) {
  console.log(variable)
  return new Promise(resolve => {
    const handler = {
      set(target, key, value) {
        target[key] = value
        if (key === "value" && value === isi) {
          resolve()
        }
        return true
      }
    }

    const proxyVariable = new Proxy(variable, handler);

    // Menunggu sampai variabel memiliki nilai "finish"
    (function checkFinish() {
      if (proxyVariable.value !== isi) {
        setTimeout(checkFinish, 1000)
      }
      console.log(variable)
    })()
  })
}

const time = moment().tz(timeZone)

const generateKeyPair = () => {
  const { pubKey, privKey } = curve.generateKeyPair()
  return {
    private: Buffer.from(privKey),
    public: Buffer.from(pubKey.slice(1))
  }
}

const generateSignalPubKey = pubKey => {
  return pubKey.length === 33
    ? pubKey
    : Buffer.concat([Buffer.from([5]), pubKey])
}

const sign = (privateKey, buf) => {
  return curve.calculateSignature(privateKey, buf)
}

const signedKeyPair = (identityKeyPair, keyId) => {
  const preKey = generateKeyPair()
  const pubKey = generateSignalPubKey(preKey.public)
  const signature = sign(identityKeyPair.private, pubKey)
  return { keyPair: preKey, signature, keyId }
}

const allocate = str => {
  let p = str.length

  if (!p) {
    return new Uint8Array(1)
  }

  let n = 0

  while (--p % 4 > 1 && str.charAt(p) === "=") {
    ++n
  }

  return new Uint8Array(Math.ceil(str.length * 3) / 4 - n).fill(0)
}

const parseTimestamp = timestamp => {
  if (typeof timestamp === "string") {
    return parseInt(timestamp, 10)
  }

  if (typeof timestamp === "number") {
    return timestamp
  }

  return timestamp
}

export const fromObject = args => {
  const f = {
    ...args.fingerprint,
    deviceIndexes: Array.isArray(args.fingerprint.deviceIndexes)
      ? args.fingerprint.deviceIndexes
      : []
  }

  const message = {
    keyData: Array.isArray(args.keyData) ? args.keyData : new Uint8Array(),
    fingerprint: {
      rawId: f.rawId || 0,
      currentIndex: f.rawId || 0,
      deviceIndexes: f.deviceIndexes
    },
    timestamp: parseTimestamp(args.timestamp)
  }

  if (typeof args.keyData === "string") {
    message.keyData = allocate(args.keyData)
  }

  return message
}

export const BufferJSON = {
  replacer: (_, value) => {
    if (value?.type === "Buffer" && Array.isArray(value?.data)) {
      return {
        type: "Buffer",
        data: Buffer.from(value?.data).toString("base64")
      }
    }
    return value
  },
  reviver: (_, value) => {
    if (value?.type === "Buffer") {
      return Buffer.from(value?.data, "base64")
    }
    return value
  }
}

export const initAuthCreds = () => {
  const identityKey = generateKeyPair()
  return {
    noiseKey: generateKeyPair(),
    pairingEphemeralKeyPair: generateKeyPair(),
    signedIdentityKey: identityKey,
    signedPreKey: signedKeyPair(identityKey, 1),
    registrationId: Uint16Array.from(randomBytes(2))[0] & 16383,
    advSecretKey: randomBytes(32).toString("base64"),
    processedHistoryMessages: [],
    nextPreKeyId: 1,
    firstUnuploadedPreKeyId: 1,
    accountSyncCounter: 0,
    accountSettings: {
      unarchiveChats: false
    },
    deviceId: Buffer.from(randomUUID().replace(/-/g, ""), "hex").toString(
      "base64url"
    ),
    phoneId: randomUUID(),
    identityId: randomBytes(20),
    backupToken: randomBytes(20),
    registered: false,
    registration: {},
    pairingCode: undefined,
    lastPropHash: undefined,
    routingInfo: undefined
  }
}


export {
  __filename,
  __dirname,
  randomInt,
  delay,
  getUptime,
  time,
  wait,
  frontText,
  run
}

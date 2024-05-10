import baileys from "@whiskeysockets/baileys"
import util, { inspect } from "util"
import fs from "fs"
import * as utils from "../lib/utils.js"
import path from "path"

const handler = async (conn, config, m) => {
  const { id, args, reply, storage} = config
  const text = args.join(" ")
  try {
    const result = await eval(`(async () => { ${text} })()`)
    console.log(result)
    if(typeof result == "object"){
      await m.reply(id, `Stdout:\n ${JSON.stringify(result)}` )
    } else {
      await m.reply(id, `Stdout:\n ${result}` )
    }
  } catch(e){
    await m.reply(id, `Stderr:\n ${e}`)
  }
}

handler.cmd = /^(==>)$/i
handler.desc = "execution baileys, Variable :\nsocket as `conn`,\nmessage as `m`, \nbaileys as `baileys`, \nstore(makeInMemoryStore()) as `storage`, \nconfiguration as `config`"
handler.category = "utility"
handler.args = "<command>"
handler.admin = true


export default handler

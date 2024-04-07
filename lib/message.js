import { wait, __dirname } from "./utils.js"
import fs from "fs"
import { join } from "path"
import { commands, menu } from "./plugins.js"
import { prefix, botName, messageLoading, messageLoadingText } from "./config.js"
import process from "process"

const usePremium = process.argv.includes("--use-premium")
const groupOnly = process.argv.includes("--group-only")

const answerData = []

const dataUser = {
  admin: JSON.parse(fs.readFileSync(join(__dirname, "../permissions/admin.json"))),
  premium: JSON.parse(fs.readFileSync(join(__dirname, "../permissions/premium.json")))
}
const promote = {
  read: async (id) => {
    const admin = dataUser?.admin?.data?.find(item => item === id) || false
    const premium = dataUser?.premium?.data?.find(item => item === id ) || false
    if(admin !== false){
      return { exist: true, id: admin, status: "admin" }
    } else if(premium !== false){
      return { exist: true, id: premium, status: "premium" }
    } else {
      return { exist: false, id: id, status: "normal" }
    }
  },
  create: async (status, id) => {
    if(status === "premium"){
      dataUser?.premium?.data?.push(id)
      const newData = JSON.stringify(dataUser?.premium, undefined, 2)
      fs.writeFileSync(join(__dirname, "../permissions/premium.json"), newData, "utf8")
      return "ok"
    } else if(status === "admin"){
      dataUser?.admin?.data?.push(id)
      const newData = JSON.stringify(dataUser?.admin, undefined, 2)
      fs.writeFileSync(join(__dirname, "../permissions/admin.json"), newData, "utf8")
      return "ok"
    } else {
      return "Error adding user"
    }
  },
  delete: async (status, id) => {
    if(status === "premium"){
      const newData = { data: dataUser?.premium?.data?.filter(item => item !== id)}
      fs.writeFileSync(join(__dirname, "../permissions/premium.json"), JSON.stringify(newData, undefined, 2), "utf8")
      return "ok"
    } else if(status === "admin"){
      const newData = { data: dataUser?.admin?.data?.filter(item => item !== id)}
      fs.writeFileSync(join(__dirname, "../permissions/admin.json"), JSON.stringify(newData, undefined, 2), "utf8")
      return "ok"
    } else {
      return "Error deleteing user"
    }
  }
}


export default async (conn, m) => {
  for( const msg of m.messages ) {
    msg.reply = async (jid, text) => {
      const res = await conn.sendMessage(jid, { text: text }, { quoted: msg })
      return res
    }
    await conn.readMessages([msg?.key])
    let data = {
      id: msg?.key?.remoteJid,
      personalId: (msg?.key?.remoteJid.endsWith("@g.us")) ? msg?.key?.participant : msg?.key?.remoteJid,
      username: msg?.pushName,
      text: msg?.message?.conversation || (msg?.message?.videoMessage || msg?.message?.imageMessage)?.caption || msg?.message?.extendedTextMessage?.text
    }
    const editedData = {
      args: data?.text?.split(" ")?.slice(1),
      commandName: data?.text?.split(" ")?.slice(0, 1)[0]?.slice(1),
      messagePrefix: data?.text?.slice(0, 1),
      phoneNumber: data?.personalId?.split("@")[0],
      groupId: (!data?.id?.endsWith("@s.whatsapp.net")) ? data?.id?.split("@")[0] : "not found",
      thisGroup: (data?.id?.endsWith("@s.whatsapp.net")) ? false : true
    }
    const key = {
      remoteJid: data?.id,
      id: msg?.message?.extendedTextMessage?.contextInfo?.stanzaId || "not found",
      fromMe: false,
      participant: msg?.message?.extendedTextMessage?.contextInfo?.participant || "not found"
    }
    const config = {
      id: data?.id,
      commandName: editedData?.commandName,
      args: editedData?.args,
      msgPrefix: editedData?.messagePrefix,
      globalPrefix: prefix,
      phoneNumber: editedData?.phoneNumber,
      user: data?.username,
      reply: key,
      media: msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage,
      group: {
        status: editedData?.thisGroup,
        id: editedData?.groupId
      },
      adminControl: {
        promote,
        dataUser
      }
    }
    const { id, status } = await promote.read(data?.personalId)
    if(prefix === editedData?.messagePrefix){
      await conn.sendMessage(data?.id, { react: {
        text: "📖",
        key: msg?.key
      }})
      if(/^(menu)$/i.test(editedData?.commandName)) {
        const txt = await menu(data?.username)
        const adReply = {
          text: txt,
          contextInfo: {
            externalAdReply: {
              title: botName,
              thumbnail: fs.readFileSync(join(__dirname, "../src/menu.jpg")),
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }
        await conn.sendMessage(data?.id, adReply, { quoted: msg })
      }
      for( const command of commands ) {
        if(command.cmd.test(editedData?.commandName)){
          console.log(`Command ${editedData?.commandName} summoning, from data\n`, {
            argument: editedData?.args,
            commandName: editedData?.commandName,
            callingForUser: data?.username
          })
          // const execute = await command(conn, config, msg)
          if(messageLoading == true){
            await msg.reply(data?.id, messageLoadingText)
          }
          if(/^(info)$/i.test(editedData?.args[0])){
            await msg?.reply(data?.id, command?.desc)
          } else if(groupOnly && editedData?.thisGroup !== true) {
            await msg.reply(data?.id, "Your use private chat, this bot use group only, please use command in group")
          } else if(usePremium && command.public && status === "normal") {
            try {
              const execute = await command(conn, config, msg)
              answerData.splice(0, answerData.length)
              answerData.push(execute)
            } catch(e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if(!usePremium && !command.admin) {
            try {
              const execute = await command(conn, config, msg)
              answerData.splice(0, answerData.length)
              answerData.push(execute)
            } catch(e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if((usePremium && status !== "premium") && (usePremium && status !== "admin")) {
            await msg.reply(data?.id, "You are not premium user, please register with the admin to become a premium user.")
          } else if(command.admin && status !== "admin") {
            await msg.reply(data?.id, "your not admin, this command for admin")
          } else if(status === "admin" && command.admin) {
            try {
              const execute = await command(conn, config, msg)
              answerData.splice(0, answerData.length)
              answerData.push(execute)
            } catch(e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if(status === "premium" && usePremium) {
            try {
              const execute = await command(conn, config, msg)
              answerData.splice(0, answerData.length)
              answerData.push(execute)
            } catch(e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if(!usePremium && status === 'normal') {
            try {
              const execute = await command(conn, config, msg)
              answerData.splice(0, answerData.length)
              answerData.push(execute)
            } catch(e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else {
            await msg.reply(data?.id, "User no matched from data permissions")
          }
        } else if(command.answerCommand?.test(editedData?.commandName)){
          await command.answer(answerData[0], conn, config, msg)
          answerData.splice(0, answerData.length)
        }
      }
      await conn.sendMessage(data?.id, { react: {
        text: "✅",
        key: msg?.key
      }})
    }

    console.log("replying to", msg?.key?.remoteJid, `\nType ${m.type}\nMessage from ${data.username} \n ${data?.text}\n`)
  }
}

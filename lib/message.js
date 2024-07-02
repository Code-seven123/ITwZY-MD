import { wait, __dirname } from "./utils.js"
import fs from "fs"
import { join } from "path"
import { commands, menu } from "./plugins.js"
import { limit, prefix, botName, messageLoading } from "./config.js"
import process from "process"
import readline from "readline"
import baileys from "@whiskeysockets/baileys"
const { proto } = baileys

const type = x => x?.constructor?.name || (x === null ? "null" : "undefined")
const isStringSame = (x, y) => (Array.isArray(y) ? y.includes(x) : y === x)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const usePremium = process.argv.includes("--use-premium")
const groupOnly = process.argv.includes("--group-only")

let answerData = []

const dataUser = {
  admin: JSON.parse(
    fs.readFileSync(join(__dirname, "../permissions/admin.json"))
  ),
  premium: JSON.parse(
    fs.readFileSync(join(__dirname, "../permissions/premium.json"))
  )
}

console.log("Limit bot set in", limit)
global.dataPenalti = {}

const promote = {
  read: async id => {
    const admin = dataUser?.admin?.data?.find(item => item === id) || false
    const premium = dataUser?.premium?.data?.find(item => item === id) || false
    if (admin !== false) {
      return { exist: true, id: admin, status: "admin" }
    } else if (premium !== false) {
      return { exist: true, id: premium, status: "premium" }
    } else {
      return { exist: false, id: id, status: "normal" }
    }
  },
  create: async (status, id) => {
    if (status === "premium") {
      dataUser?.premium?.data?.push(id)
      const newData = JSON.stringify(dataUser?.premium, undefined, 2)
      fs.writeFileSync(
        join(__dirname, "../permissions/premium.json"),
        newData,
        "utf8"
      )
      return "ok"
    } else if (status === "admin") {
      dataUser?.admin?.data?.push(id)
      const newData = JSON.stringify(dataUser?.admin, undefined, 2)
      fs.writeFileSync(
        join(__dirname, "../permissions/admin.json"),
        newData,
        "utf8"
      )
      return "ok"
    } else {
      return "Error adding user"
    }
  },
  delete: async (status, id) => {
    if (status === "premium") {
      const newData = {
        data: dataUser?.premium?.data?.filter(item => item !== id)
      }
      fs.writeFileSync(
        join(__dirname, "../permissions/premium.json"),
        JSON.stringify(newData, undefined, 2),
        "utf8"
      )
      return "ok"
    } else if (status === "admin") {
      const newData = {
        data: dataUser?.admin?.data?.filter(item => item !== id)
      }
      fs.writeFileSync(
        join(__dirname, "../permissions/admin.json"),
        JSON.stringify(newData, undefined, 2),
        "utf8"
      )
      return "ok"
    } else {
      return "Error deleteing user"
    }
  }
}

export default async (conn, m, storage) => {
  for (const msg of m.messages) {
    msg.reply = async (jid, text) => {
      const res = await conn.sendMessage(jid, { text: text }, { quoted: msg })
      return res
    }
    const buttonTypes = [
      "single_select",
      "quick_reply",
      "cta_url",
      "cta_call",
      "cta_copy",
      "cta_reminder",
      "cta_cancel_reminder",
      "address_message",
      "send_location"
    ]
    msg.interactiveMessage = async (
      jid,
      body,
      footer,
      title,
      subtitle,
      media,
      buttons,
      quoted,
      options = {}
    ) => {
      if (type(jid) !== "String")
        throw TypeError(`jid only accepts String, type given: ${type(jid)}`)
      if (type(body) !== "String")
        throw TypeError(`body only accepts String, type given: ${type(body)}`)
      if (footer && type(footer) !== "String")
        throw TypeError(
          `footer only accepts String, type given: ${type(footer)}`
        )
      if (type(title) !== "String")
        throw TypeError(
          `title only accepts String, type given: ${type(title)}`
        )
      if (subtitle && type(subtitle) !== "String")
        throw TypeError(
          `subtitle only accepts String, type given: ${type(subtitle)}`
        )
      if (media && type(media) !== "Object")
        throw TypeError(
          `media only accepts Object, type given: ${type(media)}`
        )
      if (!Array.isArray(buttons))
        throw TypeError(
          `buttons only accepts Array, type given: ${type(buttons)}`
        )
      if (
        quoted &&
        type(quoted) !== "Object" &&
        type(quoted) !== "WebMessageInfo" &&
        type(quoted) !== "Message"
      )
        throw TypeError(
          `quoted only accepts Object, WebMessageInfo, and Message, type given: ${type(
            quoted
          )}`
        )
      if (options && type(options) !== "Object")
        throw TypeError(
          `options only accepts Object, type given: ${type(options)}`
        )

      if (media) {
        if (type(media.type) !== "String")
          throw new TypeError(
            `media.type only accepts String, type given: ${type(media.type)}`
          )
        if (type(media.data) !== "Buffer" && type(media.data) !== "Object")
          throw new TypeError(
            `media.data only accepts Buffer or Object, type given: ${type(
              media.data
            )}`
          )
        if (!isStringSame(media.type, ["image", "video", "document"]))
          throw new TypeError(
            `media.type only accepts image, video, or document. Value given: ${media.type}`
          )
        if (!media.data?.url && type(media.data) !== "Buffer")
          throw new TypeError(
            `media.data only accepts Buffer or Object with url key, type given: ${type(
              media.data
            )}`
          )
      }
      for (const i in buttons) {
        const button = buttons[i]
        if (type(button.type) !== "String")
          throw new TypeError(
            `buttons[${i}].type only accepts String, type given: ${type(
              button.type
            )}`
          )
        if (!isStringSame(button.type, buttonTypes))
          throw new TypeError(
            `buttons[${i}].type is not supported. Type given: ${button.type}`
          )

        switch (button.type) {
        default: {
          throw new Error("wait... how is that possible??")
        }

        case "single_select": {
          if (type(button.title) !== "String")
            throw new TypeError(
              `buttons[${i}].title only accepts String, type given: ${type(
                button.title
              )}`
            )
          if (type(button.sections) !== "Array")
            throw new TypeError(
              `buttons[${i}].sections only accepts Array, type given: ${type(
                button.sections
              )}`
            )
          for (const ii in button.sections) {
            if (type(button.sections[ii].title) !== "String")
              throw new TypeError(
                `buttons[${i}].sections[${ii}].title only accepts String, type given: ${type(
                  button.sections[ii].title
                )}`
              )
            if (type(button.sections[ii].highlight_label) !== "String")
              throw new TypeError(
                `buttons[${i}].sections[${ii}].highlight_label only accepts String, type given: ${type(
                  button.sections[ii].highlight_label
                )}`
              )
            if (type(button.sections[ii].rows) !== "Array")
              throw new TypeError(
                `buttons[${i}].sections[${ii}].rows only accepts Array, type given: ${type(
                  button.sections[ii].rows
                )}`
              )
            for (const iii in button.sections[ii].rows) {
              if (type(button.sections[ii].rows[iii].header) !== "String")
                throw new TypeError(
                  `buttons[${i}].rows[iii].sections[${ii}].rows[iii].header only accepts String, type given: ${type(
                    button.sections[ii].rows[iii].header
                  )}`
                )
              if (type(button.sections[ii].rows[iii].title) !== "String")
                throw new TypeError(
                  `buttons[${i}].rows[iii].sections[${ii}].rows[iii].title only accepts String, type given: ${type(
                    button.sections[ii].rows[iii].title
                  )}`
                )
              if (
                type(button.sections[ii].rows[iii].description) !== "String"
              )
                throw new TypeError(
                  `buttons[${i}].rows[iii].sections[${ii}].rows[iii].description only accepts String, type given: ${type(
                    button.sections[ii].rows[iii].description
                  )}`
                )
              if (type(button.sections[ii].rows[iii].id) !== "String")
                throw new TypeError(
                  `buttons[${i}].rows[iii].sections[${ii}].rows[iii].id only accepts String, type given: ${type(
                    button.sections[ii].rows[iii].id
                  )}`
                )
            }
          }
          break
        }
        case "quick_reply":
        case "cta_reminder":
        case "cta_cancel_reminder":
        case "address_message": {
          if (type(button.display_text) !== "String")
            throw new TypeError(
              `buttons[${i}].display_text only accepts String, type given: ${type(
                button.display_text
              )}`
            )
          if (type(button.id) !== "String")
            throw new TypeError(
              `buttons[${i}].id only accepts String, type given: ${type(
                button.id
              )}`
            )
          break
        }
        case "cta_call": {
          if (type(button.display_text) !== "String")
            throw new TypeError(
              `buttons[${i}].display_text only accepts String, type given: ${type(
                button.display_text
              )}`
            )
          if (type(button.phone_number) !== "String")
            throw new TypeError(
              `buttons[${i}].phone_number only accepts String, type given: ${type(
                button.phone_number
              )}`
            )
          break
        }
        case "cta_url": {
          if (type(button.display_text) !== "String")
            throw new TypeError(
              `buttons[${i}].display_text only accepts String, type given: ${type(
                button.display_text
              )}`
            )
          if (type(button.url) !== "String")
            throw new TypeError(
              `buttons[${i}].url only accepts String, type given: ${type(
                button.url
              )}`
            )
          if (type(button.merchant_url) !== "String")
            throw new TypeError(
              `buttons[${i}].merchant_url only accepts String, type given: ${type(
                button.merchant_url
              )}`
            )
          break
        }
        case "cta_copy": {
          if (type(button.display_text) !== "String")
            throw new TypeError(
              `buttons[${i}].display_text only accepts String, type given: ${type(
                button.display_text
              )}`
            )
          if (type(button.copy_code) !== "String")
            throw new TypeError(
              `buttons[${i}].copy_code only accepts String, type given: ${type(
                button.copy_code
              )}`
            )
          break
        }
        case "send_location": {
          break
        }
        }
      }
      if (buttons.length > 10) throw new RangeError("maximum is 10 buttons")
      // ### End of validation ###

      // ### Start of sending message ###
      const msg = baileys.generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: body
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                  text: footer
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                  title,
                  subtitle,
                  hasMediaAttachment: !!media,
                  ...(media
                    ? await baileys.generateWAMessageContent(
                      {
                        [media.type]: media.data
                      },
                      {
                        upload: conn.waUploadToServer
                      }
                    )
                    : {})
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                    {
                      buttons: buttons.map(v => {
                        const { type } = v
                        delete v.type
                        return {
                          name: type,
                          buttonParamsJson: JSON.stringify(v)
                        }
                      })
                    }
                  ),
                contextInfo: {
                  mentionedJid: options.mentions || [],
                  ...options.contextInfo,
                  ...(quoted
                    ? {
                      stanzaId: quoted.key.id,
                      remoteJid: quoted.key.remoteJid,
                      participant:
                          quoted.key.participant || quoted.key.remoteJid,
                      fromMe: quoted.key.fromMe,
                      quotedMessage: quoted.message
                    }
                    : {})
                }
              })
            }
          }
        },
        {}
      )
      await conn.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
      })
      // ### End of sending message ###

      return msg
    }
    await conn.readMessages([msg?.key])
    let data = {
      id: msg?.key?.remoteJid,
      personalId: msg?.key?.remoteJid.endsWith("@g.us")
        ? msg?.key?.participant
        : msg?.key?.remoteJid,
      username: msg?.pushName,
      text:
        msg?.message?.interactiveResponseMessage?.body?.text ||
        msg?.message?.conversation ||
        (msg?.message?.videoMessage || msg?.message?.imageMessage)?.caption ||
        msg?.message?.extendedTextMessage?.text
    }
    const editedData = {
      args: data?.text?.split(" ")?.slice(1),
      commandName: data?.text?.split(" ")?.slice(0, 1)[0]?.slice(1),
      messagePrefix: data?.text?.slice(0, 1),
      phoneNumber: data?.personalId?.split("@")[0],
      groupId: !data?.id?.endsWith("@s.whatsapp.net")
        ? data?.id?.split("@")[0]
        : "not found",
      thisGroup: data?.id?.endsWith("@s.whatsapp.net") ? false : true
    }
    const key = {
      remoteJid: data?.id,
      id:
        msg?.message?.extendedTextMessage?.contextInfo?.stanzaId || "not found",
      fromMe: false,
      participant:
        msg?.message?.extendedTextMessage?.contextInfo?.participant ||
        "not found"
    }
    const config = {
      id: data?.id,
      personalId: data?.personalId,
      commandName: editedData?.commandName,
      args: editedData?.args,
      msgPrefix: editedData?.messagePrefix,
      globalPrefix: prefix,
      phoneNumber: editedData?.phoneNumber,
      user: data?.username,
      reply: key,
      media:
        msg.message?.imageMessage ||
        msg.message?.videoMessage ||
        msg.message?.audioMessage,
      group: {
        status: editedData?.thisGroup,
        id: editedData?.groupId
      },
      adminControl: {
        promote,
        dataUser,
        penalti: global.dataPenalti
      },
      storage: storage
    }
    const { id, status } = await promote.read(data?.personalId)
    if (prefix === editedData?.messagePrefix) {
      await conn.sendMessage(data?.id, {
        react: {
          text: "📖",
          key: msg?.key
        }
      })
      if (/^(menu)$/i.test(editedData?.commandName)) {
         const menutxt = await menu(data?.username, storage, id);
        const content = {
          text: menutxt,
          contextInfo: {
            externalAdReply: {
              title: "I-T-W-Z-Y",
              thumbnail: fs.readFileSync(join(__dirname, "../src/menu.jpg")),
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: "https://wa.me/6288222358226"
            }
          }
        }
        await conn.sendMessage(id, content, { quoted: msg })
      }
      for (const command of commands) {
        const now = new Date().getTime()
        if (
          global.dataPenalti[config.personalId]?.count >= limit &&
          !(status === "admin") &&
          !command?.noLimit
        ) {
          global.dataPenalti[config.personalId].timestamps = now + 43200000
          if (now >= global.dataPenalti[config.personalId].timestamps) {
            global.dataPenalti[config.personalId].count = 1
          }
        } else if (command.cmd.test(editedData?.commandName)) {
          const dataLimit = {
            [config?.personalId]: {
              count:
                global.dataPenalti[config.personalId]?.count === undefined
                  ? 1
                  : global.dataPenalti[config.personalId]?.count + 1,
              timestamps: 1
            }
          }
          Object.assign(global.dataPenalti, dataLimit)

          console.log(
            `Command ${editedData?.commandName} summoning, from data\n`,
            {
              argument: editedData?.args,
              commandName: editedData?.commandName,
              callingForUser: data?.username
            }
          )
          let loading = "Loading"
          const response = await conn.sendMessage(data?.id, { text: loading })
          const interval = setInterval(async () => {
            loading += "."
            if (loading.endsWith("....")) {
              loading = "Loading"
            }
            if (messageLoading == true) {
              console.log(loading)
              await conn.sendMessage(data?.id, {
                text: loading,
                edit: response.key
              })
            }
          }, 1000)
          if (/^(info)$/i.test(editedData?.args[0])) {
            await msg?.reply(data?.id, command?.desc)
          } else if (groupOnly && editedData?.thisGroup !== true) {
            await msg.reply(
              data?.id,
              "Your use private chat, this bot use group only, please use command in group"
            )
          } else if (usePremium && command.public && status === "normal") {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if (!usePremium && !command.admin) {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if (
            usePremium &&
            status !== "premium" &&
            usePremium &&
            status !== "admin"
          ) {
            await msg.reply(
              data?.id,
              "You are not premium user, please register with the admin to become a premium user."
            )
          } else if (command.admin && status !== "admin") {
            await msg.reply(data?.id, "your not admin, this command for admin")
          } else if (status === "admin" && command.admin) {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if (status === "admin") {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if (status === "premium" && usePremium) {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else if (!usePremium && status === "normal") {
            try {
              const execute = await command(conn, config, msg)
              if (execute?.mode === "quest") {
                answerData.push(execute)
              }
            } catch (e) {
              await msg.reply(data?.id, `Error message: ${e}`)
            }
          } else {
            await msg.reply(data?.id, "User no matched from data permissions")
          }
          clearInterval(interval)
        } else if (command.answerCommand?.test(editedData?.commandName)) {
          let loading = "Loading"
          const interval = setInterval(async () => {
            loading += "."
            if (loading.endsWith("....")) {
              loading = "Loading"
            }
            console.log(messageLoading)
            if (messageLoading == true) {
              console.log(loading)
              await msg.reply(data?.id, loading)
            }
          }, 1000)
          const res = await command.answer(answerData, conn, config, msg)
          if (res === "ok") {
            answerData.splice(0, answerData.length)
          }
          clearInterval(interval)
        }
      }
      await conn.sendMessage(data?.id, {
        react: {
          text: "✅",
          key: msg?.key
        }
      })
    }
    console.log(
      "replying to",
      msg?.key?.remoteJid,
      `\nType ${m.type}\nMessage from ${data?.username} \n ${data?.text}\n`
    )
  }
}

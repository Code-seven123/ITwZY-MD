import fs from "fs";
import { frontText, __dirname, time, getUptime } from "./utils.js";
import { join } from "path";
import { prefix, botName } from "./config.js";
import bailesy from "@whiskeysockets/baileys";

const uptime = await getUptime();

const pluginsPath = join(__dirname, "../plugins");

async function getPlugins() {
  const getAllFiles = fs.readdirSync(pluginsPath);
  const filteredFiles = getAllFiles.filter(i => i.endsWith(".js"));
  const filteredPath = filteredFiles.map(i => join(pluginsPath, i));
  const pluginsData = [];
  for (const filteredFile of filteredPath) {
    const readingFile = await import(filteredFile);
    pluginsData.push(readingFile.default);
  }
  return pluginsData.sort();
}

const datas = await getPlugins();

const commandName = [];
for (const data of datas) {
  const command = data?.cmd?.toString()?.slice(3)?.slice(0, -4).split("|");
  commandName.push(command.flat());
}
const newCommandName = commandName.flat();

getPlugins().then(i => console.log(`Attack ${i.length} plugins`));

async function listByCategory() {
  const data = await getPlugins();
  const category = Array.from(
    new Set(data.map(i => i.category.toLowerCase()))
  ).sort();
  const sortingData = category.map(item => {
    return {
      category: item.toLowerCase(),
      data: data.filter(i => i.category.toLowerCase() === item)
    };
  });
  return sortingData;
}

async function listedData() {
  const plugins = await listByCategory();
  const buttons = [];
  for (const plugin of plugins) {
    const resultData = plugin.data
      .map(item => {
        const args =
          item.args !== undefined && item.args !== null ? item.args : "";
        const commandName = item.cmd
          ?.toString()
          ?.slice(3)
          ?.slice(0, -4)
          .split("|");
        const styled = [];
        for (const item of commandName) {
          styled.push({
            header: `${item} ${args}`,
            title: `${prefix}${item} info`
          });
        }
        return styled;
      })
      .flat(1);
    const rows = [];
    for (const list of resultData.flat(1)) {
      rows.push({
        header: list.header,
        title: list.title,
        id: "id"
      });
    }
    const list = {
      title: `${frontText(plugin.category)} list`,
      sections: [
        {
          title: frontText(plugin.category),
          rows: rows
        }
      ]
    };
    buttons.push({
      name: "single_select",
      buttonParamsJson: JSON.stringify(list)
    });
  }
  return buttons;
}

async function menu(user, storage, id) {
  const keys = Object.keys(storage.contacts);
  const contactsArray = keys.map(i => storage.contacts[i]);
  const contact = contactsArray.filter(i =>
    i.id.endsWith("s.whatsapp.net")
  ).length;
  const group = Object.keys(storage.messages).filter(i =>
    i.endsWith("g.us")
  ).length;
  const txt =
    `Konnichiwa ${user}\n\n` +
    `📆Today: ${time.format("MMMM DD, YYYY")}\n` +
    `🕓Clock: ${time.format("HH:mm:ss")}\n` +
    `🤖Bot Name: ${botName}\n` +
    `⏳Uptime: ${uptime}\n` +
    `🕹️Total Command: ${datas.length}\n\n` +
    "☎️Contact Information\n" +
    `- 🌐Group: ${group}\n` +
    `- 📞Contact: ${contact}\n\n` +
    `Use 'info' to view information or description of the command. \nExample: \n${prefix}menu info`;
  const listData = await listedData();
  let msg = bailesy.generateWAMessageFromContent(
    id,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: bailesy.proto.Message.InteractiveMessage.create({
            body: bailesy.proto.Message.InteractiveMessage.Body.create({
              text: "Succes getting plugins list"
            }),
            header: bailesy.proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: true,
              jpegThumbnail: fs.readFileSync(join(__dirname, "../src/menu.jpg"))
            }),
            nativeFlowMessage:
              bailesy.proto.Message.InteractiveMessage.NativeFlowMessage.create(
                {
                  buttons: listData
                }
              )
          })
        }
      }
    },
    {}
  );

  return {
    list: msg,
    header: txt
  };
}

export { menu, datas as commands, newCommandName as commandName };
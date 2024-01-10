import { dirname } from 'path';
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'
import importFile from './import.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = []

const foldersPath = path.join(__dirname, 'plugins');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);                                                                                         const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {                                                                                                             const filePath = path.join(commandsPath, file);
    const command = await importFile(filePath)
    commands.push(command);
  }
}
console.log(commands)
export default commands

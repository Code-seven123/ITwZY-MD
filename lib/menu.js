import cfg from '../config.js'
import moment from 'moment'
import commands from '../plugins.js'
const msg = (user, globalPrefix) => {
  const msg = `*WALCOME* ${user} \n`
    + `📆today is : ${moment().format('MMMM DD, YYYY')}\n`
    + `🕓time is : ${moment().format('HH:mm:ss')} \n\n`
    + `🤖Bot Name : ${cfg.botName}\n`
    + `👨🏻‍💻Owner Name : ${cfg.owner[0].name}\n`
    + `☎️Number : ${cfg.owner[0].number}\n\n\n`
  const head = []
  for (const command of commands){
    const args = ( command.default.args == null ) ? ' ' : `+ ${command.default.args}`
    const c = command.default.cmd.toString().slice(3).slice(0, -4).split('|')
    const cmd = `\n\n   >>${command.default.category}<<\n`
      + `|  ${globalPrefix}${c.join('\n|  .')} ${args}\n`
      + `|    [ ${command.default.desc} ] `
    head.push(cmd)
  }
  const body = msg + '---< Menu Command >---' + head.join(' ')
  return body
}
export default msg

import { config } from 'dotenv';
config()
const env = process.env
const cfg = {}
//owner
cfg.prefix = env.BOT_PREFIX
cfg.botName = env.BOT_NAME
cfg.owner = (JSON.parse(env.OWNER)).data
//log
cfg.levelLog = env.LEVEL_LOG

//menu
cfg.thumnailMenus = env.THUMNAIL_MENU

//loading
cfg.loadingMsg = env.LOADING_MSG
cfg.loadingMsgText = env.LOADING_TEXT

//Browser use
cfg.browser = env.BROWSER.split(',')

//server web
cfg.port = env.PORT

export default cfg

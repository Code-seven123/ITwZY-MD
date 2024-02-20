import y2mate from 'y2mate-dl'
const handler = async (conn, { args, id }, m) => {
	const url = args[0]
	const res = await y2mate.ytmp3(url)
	const text = `Info \n *owner*: ${res.owner}\n*title*: ${res.title}\n*size*: ${res.size}`
	await conn.sendMessage(id, { audio: {
		url: res.mp3
	}, caption: text }, { quoted: m })
}

handler.cmd = /^(yt3|ytmp3)$/i
handler.desc = 'youtube downloader from mp3'
handler.category = 'download'
handler.args = '<url>'

export default handler

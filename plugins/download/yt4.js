import y2mate from 'y2mate-dl'
const handler = async (conn, { args, id }, m) => {
  const reso = args[0]
  const url = args[1]
	
  if(reso === '360'){
		const res = await y2mate.yt360(url)
	  const text = `Info \n *owner*: ${res.owner}\n*title*: ${res.title}\n*size*: ${res.size}`
	  await conn.sendMessage(id, { video: {
	    url: res.url
	  }, caption: text }, { quoted: m })
  } else if(reso === '480'){
		const res = await y2mate.yt480(url)
	  const text = `Info \n *owner*: ${res.owner}\n*title*: ${res.title}\n*size*: ${res.size}`
	  await conn.sendMessage(id, { video: {
	    url: res.url
	  }, caption: text }, { quoted: m })
  } else if(reso === '720'){
		const res = await y2mate.yt720(url)
	  const text = `Info \n *owner*: ${res.owner}\n*title*: ${res.title}\n*size*: ${res.size}`
	  await conn.sendMessage(id, { video: {
	    url: res.url
	  }, caption: text }, { quoted: m })
  }else {
		await conn.sendMessage(id, { text: "resolusi not found and url not found" })
  }
}

handler.cmd = /^(yt4|ytmp4)$/i
handler.desc = 'youtube downloader from mp4'
handler.category = 'download'
handler.args = '<resolusi> + <url>'

export default handler

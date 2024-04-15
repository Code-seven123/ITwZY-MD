import axios from "axios";

function parseSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor(s / 60) % 60;
  s = Math.floor(s) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
}

/**
 * @typedef Info
 * @prop {string} title - Título del video
 * @prop {number} duration - Duración del video en segundos
 * @prop {string} parsedDuration - Duración del video formateada (HH:MM:SS)
 * @prop {string} author - Nombre del canal
 */
/**
 * @typedef Links
 * @prop {AV[]} audio
 * @prop {AV[]} video
 */
/**
 * @typedef AV
 * @prop {string} size
 * @prop {string} format
 * @prop {string} quality
 * @prop {Url} url
 */
/**
 * @typedef Url
 * @returns {Promise<String>}
 */
/**
 * @typedef Infos
 * @prop {Info} info - Información del video
 * @prop {Links} links - Enlaces de audio y video
 */

const regex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)?(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
/**
 * Obtiene la información de un video de YouTube
 *
 * @param {String} url Enlace del video de YouTube
 * @returns {Promise<Infos>}
 */
async function info(url) {
  if(!regex.test(url)) return false

  const { data } = await axios.post("https://www.yt1s.com/api/ajaxSearch/index", new URLSearchParams({
    q: url,
    vt: "home"
  }), {
    headers: {
      "User-Agent": "WhatsApp/2.23.25.3"
    }
  });
  const info = {
    title: data.title,
    duration: data.t,
    parsedDuration: parseSeconds(data.t),
    author: data.a
  };
  const links = {
    videos: Object.values(data.links.mp4),
    audios: Object.values(data.links.mp3)
  };
  for(const i in links) links[i] = links[i].map(v => ({
    size: v.size,
    format: v.f,
    quality: v.q,
    url: download.bind({}, data.vid, v.k)
  })).sort((a, b) => (a.quality.slice(0, -1)*1) - (b.quality.slice(0, -1)*1));

  return {
    info,
    links
  };
}

/**
 * @param {String} id
 * @param {String} k
 * @returns {Promise<String>}
 */
async function download(id, k) {
  const { data } = await axios.post("https://www.yt1s.com/api/ajaxConvert/convert", new URLSearchParams({
    vid: id,
    k
  }), {
    headers: {
      "User-Agent": "WhatsApp/2.23.25.3"
    }
  });

  return data.dlink;
}

export default info;

const test = () => new Promise(resolve => setTimeout(() => console.log(true), 2000))
const cmd = "await test()"
const res = await eval(`(async () => { ${cmd} })()`)
console.log(res)

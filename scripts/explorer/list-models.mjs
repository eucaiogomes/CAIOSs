const html = await fetch('http://127.0.0.1:9119/?profile=explorer').then((r) => r.text())
const token = html.match(/__HERMES_SESSION_TOKEN__="([^"]+)"/)?.[1]
if (!token) throw new Error('no token')
const res = await fetch('http://127.0.0.1:9119/api/model/options?profile=explorer', {
  headers: { 'X-Hermes-Session-Token': token },
})
console.log(await res.text())
const fetch = require('node-fetch')
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Api ligada')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
let gateway = 'https://api-projeto-3.herokuapp.com'
let date = 0

async function login(e, p) {
  let res = await fetch(gateway + '/api/auth/login', {
    method: 'post',
    body: JSON.stringify({
      email: e,
      password: p
    }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
  date = Date.now()
  console.log(res)
  return res
}

login('EMAIL', 'PASS').then(async e => {
  setInterval(async () => {
    let all = await fetch(gateway + '/api/v1/company', {
      headers: {
        Authorization: 'Bearer ' + e.access_token,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    all.sort((a, b) => a.price - b.price)
    console.log(all)
    let buy = await fetch(gateway + `/api/v1/company/${all[0].id}/buy`, {
      method: 'POST',
      body: {
        amount: 'all'
      },
      headers: {
        Authorization: 'Bearer ' + e.access_token,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    console.log(buy)
    let next = await fetch(gateway + '/api/v1/company/next/change', {
      headers: {
        Authorization: 'Bearer ' + e.access_token,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json())
    setTimeout(async () => {
      let pr = await fetch(gateway + '/api/v1/actions', {
        headers: {
          Authorization: 'Bearer ' + e.access_token,
          'Content-Type': 'application/json'
        }
      }).then(aa => aa.json())
      console.log(pr)
      let v = pr[0]
      if (v.price_purchased < v.company.price) {
        let sel = await fetch(
          gateway + `/api/v1/company/${v.company.id}/sell`,
          {
            method: 'POST',
            body: {
              amount: 'all'
            },
            headers: {
              Authorization: 'Bearer ' + e.access_token,
              'Content-Type': 'application/json'
            }
          }
        ).then(g => g.json())
        console.log(sel)
      } else {
        console.log("O preço de venda caiu! Não vendi, faça manualmente")
      }
    }, (next.seconds + 11 + 1) * 1000)
  }, 2 * 1000 * 60 + 10 * 1000)
})

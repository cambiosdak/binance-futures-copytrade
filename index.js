var CryptoJS = require('crypto-js')
// BASE URL
let url = "https://fapi.binance.com"

//CREDENTIALS
/**
 * ACCOUNT A 
 */
let key = {
    'apiKey' : 'YOUR_KEY_GOES_HERE',
    'secretKey' : 'YOUR_SECRET_GOES_HERE'
}
/**
 * ACCOUNT B (COPY ORDERS OF ACCOUNT A)
 */
let key2 ={
  'apiKey': 'CUSTOMER_API_KEY_GOES_HERE',
  'secretKey': 'CUSTOMER_API_SECRET_GOES_HERE'
}
let axios = require('axios')
let options = {
  method: 'POST',
  url: 'https://fapi.binance.com/fapi/v1/listenKey',
  headers: {
    'X-MBX-APIKEY': `${key['apiKey']}`
  }
}
axios.request(options).then(async response =>{
    await response.data
    return listenKey = response.data.listenKey
}).then(async response => {
  console.log('Checking trades...')
  const WebSocket = require('ws')
  const wss = new WebSocket(`wss://fstream.binance.com/ws/${listenKey}`)
  wss.onmessage = (event) =>{
    let data = JSON.parse(event.data)
/**
 * 
 * ${data.o.s} PERPETUAL CONTRACT
 * 
 */
    /**
     * CREATE NEW ORDER (LIMIT)
     */
    if (data.e === 'ORDER_TRADE_UPDATE' && data.o.X === 'NEW' && data.o.o === 'LIMIT' ){
      console.log('Sending new order..')
      console.log('Entry Amount: ' + data.o.q)
      console.log('Order Type: ' + data.o.o)
      console.log('TimeInForce: ' + data.o.f)
      console.log('Entry price: ' + data.o.p)
      let quantity = data.o.q
      let price = data.o.p
      let orderType = data.o.o
      let side = data.o.S
      let params = `symbol=${data.o.s}&side=${side}&type=${orderType}&timeInForce=GTC&quantity=${quantity}&price=${price}&recvWindow=2500&timestamp=${Date.now()}`
      let signature = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
      var options = {
        headers: {
          'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
      },
      method: 'POST',
      url: `${url}/fapi/v1/order?${params}&signature=${signature}`
      }
      axios.request(options).then(response =>{
        console.log('LIMIT Order sent at ' + response.data.symbol)
        limitOrderId = response.data.orderId
      }).catch(error => console.error(error))
    }
    /**
     * CREATE NEW ORDER (MARKET)
     */
     if (data.e === 'ORDER_TRADE_UPDATE' && data.o.o === 'MARKET'  && data.o.X === 'NEW'){
      console.log('Sending new order..')
      console.log('Entry Amount: ' + data.o.q)
      console.log('Order Type: ' + data.o.o)
      console.log('Entry price: ' + data.o.p)
      let quantity = data.o.q
      let orderType = data.o.o
      let side = data.o.S
      let params = `symbol=${data.o.s}&side=${side}&type=${orderType}&quantity=${quantity}&recvWindow=2500&timestamp=${Date.now()}`
      let signature = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
      var options = {
        headers: {
          'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
      },
      method: 'POST',
      url: `${url}/fapi/v1/order?${params}&signature=${signature}`
      }
     axios.request(options).then(async response =>{
      await response.data  
      console.log('Market Order sent at ' + response.data.symbol)
      }).catch(error => console.error(error))
    }
    

    /**
     * CREATE STOP LOSS
     */
    if (data.e === 'ORDER_TRADE_UPDATE' && data.o.o === 'STOP_MARKET' && data.o.X === 'NEW'){
      let quantity = data.o.q
      let price = data.o.sp
      let orderType = data.o.o
      let side = data.o.S
      let params = `symbol=${data.o.s}&side=${side}&type=${orderType}&quantity=${quantity}&stopPrice=${price}&recvWindow=2500&timestamp=${Date.now()}`
      let signature = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
      var options = {
        headers: {
          'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
      },
      method: 'POST',
      url: `${url}/fapi/v1/order?${params}&signature=${signature}`
      }
      axios.request(options).then(async response =>{
        await response.data
        console.log('STOP LOSS SENT AT ' + response.data.symbol)
      }).catch(error => console.error(error))
    }

    /**
     * CREATE TAKE PROFIT
     */
    if (data.e === 'ORDER_TRADE_UPDATE' && data.o.o === 'TAKE_PROFIT_MARKET' && data.o.X === 'NEW'){
      let quantity = data.o.q
      let price = data.o.sp
      let orderType = data.o.o
      let side = data.o.S
      let params = `symbol=${data.o.s}&side=${side}&type=${orderType}&quantity=${quantity}&stopPrice=${price}&recvWindow=2500&timestamp=${Date.now()}`
      let signature = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
      var options = {
        headers: {
          'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
      },
      method: 'POST',
      url: `${url}/fapi/v1/order?${params}&signature=${signature}`
      }
      axios.request(options).then(async response =>{
        await response.data
        console.log('TAKE PROFIT SENT AT ' + response.data.symbol)
      }).catch(error => console.error(error))
    }
    
    // FIX LEVERAGE RATIO
    if (data.e === 'ACCOUNT_CONFIG_UPDATE' && data.ac.hasOwnProperty('l')  && data.ac.s === '${data.o.s}'){
          let params = `symbol=${data.o.s}&leverage=${data.ac.l}&recvWindow=2500&timestamp=${Date.now()}`
          let signatureLeverage = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
          let lev = {
              headers: {
                  'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
              },
              method: 'POST',
              url: `https://fapi.binance.com/fapi/v1/leverage?${params}&signature=${signatureLeverage}`
          }
         axios.request(lev).then(async (response) => {
              await response.data
              console.log('Leverage changed to: ' + response.data.leverage)
          }).catch(error => console.error(error))
    }
    /**
     * CANCEL ORDERS
     */
    if (data.e === 'ORDER_TRADE_UPDATE' && data.o.X === 'CANCELED' ){
      console.log('Order canceled on Account A...\nCanceling open orders..')
      let params = `symbol=${data.o.s}&recvWindow=2500&timestamp=${Date.now()}`
      let signatureCancel = CryptoJS.HmacSHA256(params, key2['secretKey']).toString(CryptoJS.enc.Hex)
      let cancel = {
        headers: {
            'X-MBX-APIKEY': `${key2['apiKey']}` // APIKEY OF ACCOUNT B
        },
        method: 'DELETE',
        url: `https://fapi.binance.com/fapi/v1/allOpenOrders?${params}&signature=${signatureCancel}`
    }
   axios.request(cancel).then(async (response) => {
        await response.data
        console.log('Orders canceled succesfully!')
    }).catch(error => console.error(error))
    }
  }
}).catch(error => console.log(error))



// KEEP LISTEN KEY ALIVE
setInterval(() => {
  let options = {
    method: 'PUT',
    url: 'https://fapi.binance.com/fapi/v1/listenKey',
    headers: {
      'X-MBX-APIKEY': `${key['apiKey']}`
    }
  }
  axios.request(options).then(async response =>{
     console.log('Keep alive WebSocket')
  }).catch(error => console.error(error))
}, 3500000);

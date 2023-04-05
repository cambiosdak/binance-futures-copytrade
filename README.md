# Binance Futures Copytrade

# Description
This code listens to the WebSocket of a Binance account A and mirrors orders in real-time to a Binance account B. It uses the ```axios``` package to make HTTP requests, the ```crypto-js``` package for signature encryption, and the ``ws`` package to open a WebSocket connection to receive updates. It handles four types of orders: LIMIT, MARKET, STOP LOSS, and TAKE PROFIT. Once a new order is received on account A, the code sends the same order to account B. The credentials of both accounts are provided at the beginning of the script. The API key of account A is used to open the WebSocket connection and listen for trades, and the API key of account B is used to place orders.

# Usage
Install this packages via npm:
```
npm install axios ws crypto-js
```
Replace ``key`` with your own API KEY and ``key2`` with the account where you want to replicate your trades.
```
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
```
# References
[Axios](https://www.npmjs.com/package/axios)
[Crypto-js](https://www.npmjs.com/package/crypto-js)
[ws(WebSocket)](https://www.npmjs.com/package/ws)

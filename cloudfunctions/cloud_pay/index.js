const cloud = require('wx-server-sdk')
cloud.init({
  env: 'bat'
})

exports.main = async (event, context) => {
  console.log('event:',event)
  const res = await cloud.cloudPay.unifiedOrder(event)
  return res
}

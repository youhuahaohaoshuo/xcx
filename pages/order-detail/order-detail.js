const network = require('../../common/newwork.js')
Page({
  data: {
    orderDetail: null,
    isPay: false
  },
  onLoad: function (options) {
    this.setData({
      orderDetail: JSON.parse(options.orderData)
    })
  },
  confirmPay () {
    this.setData({
      isPay: true
    })
    wx.showLoading({
      title: 'loading',
      mask: true
    })
    let orderList = this.data.orderDetail.orderList
    let ids = []
    orderList.forEach(item => {
      ids.push(item.purchaseOrderId)
    })
    network.POST('/wxPay/wxPay', {
      memberId: wx.getStorageSync('token'),
      purchaseOrderIds: ids.toString(),
      totalMoney: this.data.orderDetail.totalMoney
    }).then(res => {
      wx.hideLoading()
      
      if (res.statusCode === 200) {
        console.log(res)
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.packageStr,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': (res) => {
            wx.showToast({
              title: '支付成功',
              duration: 1000
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
          },
          'fail': res => {
            if (res.errMsg == 'requestPayment:fail cancel') {
              wx.showToast({
                title: '支付取消',
                icon: 'none',
                duration: 1000
              })
            } else {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1000
              })
            }
            this.setData({
              isPay: false
            })
          },
          'complete': res => {
            if (res.errMsg == 'requestPayment:fail cancel') {
              wx.showToast({
                title: '支付取消',
                icon: 'none',
                duration: 1000
              })
            }
            this.setData({
              isPay: false
            })
          }
        })
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        this.setData({
          isPay: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
    })
  }
})
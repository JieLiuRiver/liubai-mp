const moment = require('../../utils/moment.min.js')

Page({
  data: {
    time: '2018-11-25' 
  },
  onLoad() {

  },

  onOkSelected({ detail }) {
    let { enter, leave } = detail
    enter = enter.replace(/-/g, '.')
    leave = leave.replace(/-/g, '.')
    wx.showToast({
      title: enter + ' - ' + leave,
      icon: 'none'
    })
  }
})
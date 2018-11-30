const moment = require('../../utils/moment.min.js')

Page({
	data: {
    list: [
      {
        label: '美团小程序酒店入住日期选择',
        route: '/pages/calendar/index'
      }
    ]
	},
	onLoad() {

	},

  onOkSelected({detail}) {
    let { enter, leave } = detail
    enter = enter.replace(/-/g, '.')
    leave = leave.replace(/-/g, '.')
    wx.showModal({
      title: '选择的日期',
      content:  enter + ' - ' + leave,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
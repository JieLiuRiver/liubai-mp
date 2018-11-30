const moment = require('../../utils/moment.min.js')
const FORMAT_TYPE = 'YYYY-MM-DD'
const ENTER_WORD = '入店'
const LEAVE_WORD = '离店'
const WEEKS_CH = ['日', '一', '二', '三', '四', '五', '六']
Component({
  externalClasses: [],
  options: {

  },
  properties: {
  },
  data: {
    weeksCh: WEEKS_CH,
    viewTime: {
      year: '',
      month: '',
      day: '',
      formatDay: '',
      weekCh: '',
      viewDays: []
    },
    viewDays: [],
    availableMonths: [],
    hasLeaveDate: true,
    cellWidth: 0
  },
  ready() {
    this.setData({ cellWidth: wx.getSystemInfoSync().windowWidth / 7 }, () => console.log(this.data))
  },
  attached: function attached() {
    !this._inited && this._init()
  },
  methods: {
    _init() {
      this._inited = true
      this.setData({
        availableMonths: [
            this._getAvailableDays(moment().startOf('month'), 'today'),
            this._getAvailableDays(moment().month(moment().month() + 1).startOf('month')),
            this._getAvailableDays(moment().month(moment().month() + 2).startOf('month'))
          ]
      }, this._checkDefaultSelected)
    },

    _checkDefaultSelected() {
      const { availableMonths } = this.data
      let hasSelected = false
      availableMonths.forEach(o => {
        o.days.forEach(d => {
          if (!!o.selected) {
            hasSelected = true
          }
        })
      })
      if (!hasSelected) {
        availableMonths.forEach(o => {
          o.days.forEach(d => {
            if (d.formatDay == moment().format(FORMAT_TYPE)) {
              d = this._setEnterDate(d)
            }
          })
        })
        this.setData({ hasLeaveDate: false })
      }
      this.setData({
        availableMonths
      })
      this._log('availableMonths')
    },

    _getAvailableDays(time = moment(), type) {
      const result = {}
      result.viewTime = this._setViewTime(time)
      // 计算今天是星期几
      const todayDayOfWeek = type == 'today' ? moment().format('E') : time.format('E')
      // 令时间变为当月1号的
      const firstDay = time.startOf('month')
      // 计算当月1号是星期几
      const firstDayOfWeek = firstDay.format('E')
      // 计算上个月多余时间
      const last = this._calDate(firstDay.subtract(firstDayOfWeek, 'days'), firstDayOfWeek)
      last.forEach(o => { o.visible = false })
      // 计算本月时间
      const current = this._calDate(firstDay, firstDay.daysInMonth())
      const fullMonths = [...last, ...current]
      let formatValue = (!!type && type === 'today')
        ? moment().format(FORMAT_TYPE)
        : result.viewTime.formatDay
      const todayIdx = fullMonths.findIndex(o => o.formatDay === formatValue)
      const todayRestOfMonth = fullMonths.slice(todayIdx)
      todayRestOfMonth.forEach(o => { o.visible = true })
      // 今天对应的一周，已过去的长度
      let currentTimeOrToday = !!type && type === 'today'
        ? moment()
        : moment(result.viewTime.formatDay)
      let daysOfTodayWeekPassed = this._calDate(currentTimeOrToday.subtract(parseInt(todayDayOfWeek), 'days'), todayDayOfWeek)
      daysOfTodayWeekPassed.forEach(o => {o.visible = false})
      result.days = this._supplement(result.viewTime.formatDay, [...daysOfTodayWeekPassed, ...todayRestOfMonth])
      return result
    },

    // 补充剩余占位空格
    _supplement(formatDay, days) {
      const time = moment(formatDay).endOf('month')
      let whichWeek = time.format('E')
      whichWeek = parseInt(whichWeek) == 7 ? 0 : whichWeek
      const restCount = 7 - (parseInt(whichWeek) + 1)
      const placeholders = []
      for (let i = 0; i < restCount; i++) {
        placeholders.push({
          type: 'placeholders',
          visible: false,
          day: 0
        })
      }
      return [...days, ...placeholders]
    },

    // 设置
    _setViewTime(time = moment()) {
      return this._dealMoment(time)
    },

    _log(attr) {
      console.log(`------- ${attr } --------`, this.data[attr])
    },

    // 新增
    _calDate(time, length) {
      let arr = []
      for (let i = 0; i < length; i++) {
        arr.push(this._dealMoment(time))
        time.add(1, 'days')
      }
      return arr
    },

    // 获取日期对象
    _dealMoment(time) {
      let { years, months, date } = time.toObject()
      const wn = time.format('E')
      return {
        year: years,
        month: months + 1,
        day: date,
        weekCh: '周' + this.data.weeksCh[wn == 7 ? 0 : wn],
        formatDay: time.format(FORMAT_TYPE)
      }
    },

    // 去重
    _uniq(array) {
      var temp = [];
      var index = [];
      var l = array.length;
      for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
          if (JSON.stringify(array[i]) === JSON.stringify(array[j])) {
            i++;
            j = i;
          }
        }
        temp.push(array[i]);
        index.push(i);
      }
      return temp;
    },

    // 设置入住
    _setEnterDate(o) {
      o.selected = {
        type: 'enter',
        label: ENTER_WORD
      }
      return o
    },

    // 设置离店
    _setLeaveDate(o) {
      o.selected = {
        type: 'leave',
        label: LEAVE_WORD
      }
      return o
    },

    // 设置包含
    _setContainDate(o) {
      o.selected = {
        type: 'contain',
        label: ''
      }
      return o
    },

    // 清除所有选择的
    _cleanAllSelectedDate(availableMonths){
      availableMonths.forEach(o => {
        o.days.forEach(d => {
          d.selected = null
        })
      })
      return availableMonths
    },

    // 点击
    onPressDay(e) {
      let { availableMonths } = this.data
      const idx = e.currentTarget.dataset.idx
      const panelidx = e.currentTarget.dataset.panelidx
      let currentItem = availableMonths[panelidx].days[idx]
      let store = []
      availableMonths.forEach(o => {
        o.days.forEach(d => {
          if (!!d.selected) {
            store.push({
              ...d.selected,
              formatDay: d.formatDay
            })
          }
        })
      })
      store = this._uniq(store)
      if (!store.length || store.length > 1) {
        availableMonths = this._cleanAllSelectedDate(availableMonths)
        currentItem = this._setEnterDate(currentItem)
        this.setData({ hasLeaveDate: false })
      } else if (store.length == 1) {
        if (store[0].formatDay !== currentItem.formatDay) {
          if (moment(currentItem.formatDay).unix() > moment(store[0].formatDay).unix()) {
            currentItem = this._setLeaveDate(currentItem)
            availableMonths.forEach(o => {
              o.days.forEach(d => {
                if (moment(d.formatDay).unix() > moment(store[0].formatDay).unix() && moment(d.formatDay).unix() < moment(currentItem.formatDay).unix()) {
                  d = this._setContainDate(d)
                }
              })
            })
            this.triggerEvent('onOkSelected', {
              enter: store[0].formatDay,
              leave: currentItem.formatDay
            })
            this.setData({ hasLeaveDate: true })
          } else {
            availableMonths.forEach(o => {
              o.days.forEach(d => {
                d.selected = null
              })
            })
            currentItem = this._setEnterDate(currentItem)
            this.setData({ hasLeaveDate: false })
          }
        }
      }
      this.setData({
        availableMonths
      })
    }
  }
})

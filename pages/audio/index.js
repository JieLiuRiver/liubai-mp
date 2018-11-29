const app = getApp()
app.$db = wx.cloud.database()
app.$db.$audios = app.$db.collection('audios')
const PAGESIZE = 10
let TIMER1 = null
const coverImgUrl = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1542364988988&di=4e7294e86ed68928486b7abe771b3001&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201702%2F15%2F20170215191422_UXVx8.jpeg'
Page({
  data: {
    animation: '',
    scrollBoxHeight: 9000,
    playStatus: false,
    list: [],
    listFooterText: '',
    totalTime: 0,
    currentTime: 0,
    currentTab: 0,
    footerTabs: [
      '小音频', '关于书'
    ]
  },
  onReady() {
    this.pagenum = 1
    this.screenWidth = wx.getSystemInfoSync().windowWidth,
    this.setData({
      scrollBoxHeight: wx.getSystemInfoSync().windowHeight - 200
    })
  },
  onLoad() {
    wx.onBackgroundAudioStop(() => {
      this.handleStopAudioCallBack()
    })
    this.audiosMap = {}
    this.loadDataList(() => {})
  },
  toWebView(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: `/pages/webview/index?url=${url}`,
    })
  },
  loadDataList(cb = () => {}) {
    const that =this
    if (this.loading) return
    this.setData({
      listFooterText: '加载中'
    })
    this.loading = true
    app.$db.$audios.count({
      success: ({total}) => {
        this.total = total
        this.totalPagenum =  Math.ceil(total / PAGESIZE)
        const list = app.$db.$audios.skip((this.pagenum - 1) * PAGESIZE).limit(PAGESIZE).get({
          success: (res) => {
            res.data.forEach(o => {
              o.date = this.format(o.date)
            })
            that.setData({
              list: [...this.data.list, ...res.data] || []
            }, cb)
            this.loading = false
            that.setData({
              listFooterText: this.pagenum >= this.totalPagenum ? '没有更多了' : ''
            })
          }
        })
      }
    })
  },
  togglePlay() {
    if (this.animating) return
    this.animating = true
    this.setData({
      playStatus: !this.data.playStatus
    }, () => {
      if (this.data.playStatus) {
        if (!this.currentPlayingId) {
          const o = this.data.list[0]
          const id = o._id
          this.audiosMap[id] = wx.getBackgroundAudioManager()
          this.audiosMap[id].src = o.source
          this.audiosMap[id].title = o.name
          this.audiosMap[id].epname = o.epname
          this.audiosMap[id].coverImgUrl = coverImgUrl
          this.currentPlayingIdx = 0
          this.currentPlayingId = id
        }
        this.data.list[this.currentPlayingIdx].playing = true
        this.setData({
          list: [...this.data.list]
        })
        this.audiosMap[this.currentPlayingId].play()
        this.handleTime()
      } else {
        this.data.list[this.currentPlayingIdx].playing = false
        this.setData({
          list: [...this.data.list]
        })
        this.audiosMap[this.currentPlayingId].pause()
      }
    })
  },
  animationEnd() {
    this.animating = false
  },
  tapItem(e) {
    const { source, id, idx } = e.currentTarget.dataset
    if (this.currentPlayingIdx == idx) {
        this.setData({
          playStatus: !this.data.playStatus
        }, () => {
          if (this.data.playStatus) {
            this.data.list[this.currentPlayingIdx].playing = true
            this.audiosMap[this.currentPlayingId].play()
          } else {
            this.data.list[this.currentPlayingIdx].playing = false
            this.audiosMap[this.currentPlayingId].pause()
          }
          this.setData({
            list: [...this.data.list]
          })
        })
        return
    }
    if (!!source) {
      if (typeof this.currentPlayingId != 'undefined') {
        this.audiosMap[this.currentPlayingId].stop()
        this.data.list[this.currentPlayingIdx].playing = false
        this.data.list[this.currentPlayingIdx].progressWidth = 0
        this.setData({
          list: [...this.data.list]
        })
      }
      this.audiosMap[id] = wx.getBackgroundAudioManager()
      this.currentPlayingIdx = idx
      this.currentPlayingId = id
      this.audiosMap[id].title = this.data.list[idx].name
      this.audiosMap[id].epname = this.data.list[idx].epname
      this.audiosMap[id].coverImgUrl = coverImgUrl
      this.data.list[idx].playing = true
      this.setData({
        playStatus: true,
        list: [...this.data.list]
      })
      this.audiosMap[id].src = source
      this.audiosMap[id].play()
      // this.audiosMap[id].onTimeUpdate(this.onTimeUpdate.bind(this))
      this.handleTime()
    } else {
      wx.showToast({
        title: '作者还未上传喔～！'
      })
    }
  },
  onScrollToLower() {
    if (this.pagenum >= this.totalPagenum) return
    this.pagenum += 1
    this.loadDataList()
  },
  onTimeUpdate() {
  },
  onShareAppMessage: function ({ from, target }) {

  },
  format(nd) {
    let  d =  new Date(nd)
    const year = d.getFullYear()
    let month = (d.getMonth()) + 1
    let date = d.getDate()
    month = month <= 9 ? '0' + month : month
    date = date <= 9 ? '0' + date : date
    return year + '-' + month + '-' + date
  },
  handleStopAudioCallBack() {
    this.data.list[this.currentPlayingIdx].playing = false
    this.data.list[this.currentPlayingIdx].progressWidth = 0
    this.setData({
      playStatus: false,
      list: [...this.data.list]
    })
    TIMER1 && clearInterval(TIMER1)
    this.audiosMap[this.currentPlayingId] = null
    delete this.audiosMap[this.currentPlayingId]
    delete this.currentPlayingId
    delete this.currentPlayingIdx
  },
  switchTab(e) {
    const { idx } = e.currentTarget.dataset
    this.setData({
      currentTab: idx
    })
  },
  handleTime(){
    TIMER1 && clearInterval(TIMER1)
    TIMER1 = setInterval(() => {
      const ctx = this.audiosMap[this.currentPlayingId]
      this.data.list[this.currentPlayingIdx].progressWidth = ctx.duration == 0 ? 0 : ((ctx.currentTime / ctx.duration) * this.screenWidth).toFixed(1)
      this.setData({
        totalTime: ctx.duration,
        currentTime: ctx.currentTime,
        list: [...this.data.list]
      })
    }, 1000)
  }
})

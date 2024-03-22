// pages/videoDetail/videoDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoId:'',
    videoInfo: '',
    comments: [],
    popShow: false,
    //发评论的内容
    inputMessage: '',
    textareaHeight: 40,
    textLineCount: 1,
    scrollable: false,
    maxLength: 200,
    disableSubmit: true
  },

  getComments(videoNewId) {
    console.log(videoNewId)
    wx.showLoading({
      title: '加载中 ',
    })

    let that = this;
    wx.cloud.callFunction({
      name: 'commentHandle',
      data: {
        action: 'getComments',
        newsId: videoNewId,
        page: 0,
        num: 5
      }
    }).then(res => {
      // 任意修改对返回值的操作
      wx.hideLoading()
      // 处理提交结果
      console.log(res)
      this.setData({
        comments: res.result
      })
    }).catch(err => {
      // 任意修改对返回值的操作
      wx.hideLoading();
      console.log(err);
    })
  },

  onLoad(options){
    console.log(options.id);
    this.setData({
      videoId: options.id,
    });
    this.getVideoInfo(options.id);
  },

  getVideoInfo(videoId) {
    var that = this;
    wx.cloud.callFunction({
      name: 'videoHandle',
      data: {
        action: 'getVideoInfo',
        videoId: videoId
      }
    }).then(res => {
      console.log(res);
      that.setData({
        videoInfo: res.result
      });
    }).catch(err => {
      console.log(err);
    })
  },

  // 打开弹窗
  popupTap: function (e) {
    var videoNewId = this.data.videoId;
    //  console.log("打开弹窗")
    this.getComments(videoNewId)

    this.setData({
      popShow: true
    })
  },
  // 关闭弹窗
  closePop: function (e) {
    this.setData({
      popShow: false
    })
  },
  // 这个函数内容为空 用于阻止屏幕滚动
  preventTouchMove: function (e) {
  },

  // 评论输入框
  bindInputMsg(e) {
    let value = e.detail.value.replace(/\s+/g, '');
    let lines = this.data.textLineCount;

    let height = lines > 5 ? 5 * 40 : lines * 40;
    let scrollable = lines > 5;
    this.setData({
      inputMessage: value,
      textareaHeight: height,
      scrollable: scrollable,
      disableSubmit: value.trim().length === 0
    })
  },

  isInputBlur() {
    let lines = this.data.textLineCount;

    let height = lines > 5 ? 5 * 40 : lines * 40;
    let scrollable = lines > 5;
    this.setData({
      textareaHeight: height,
      scrollable: scrollable,
      disableSubmit: value.trim().length === 0
    })
  },

  isMaxHeight(e) {
    this.setData({
      textLineCount: e.detail.lineCount
    })
  },

  viewUserInfo() {
    wx.navigateTo({
      url: '/pages/publishShow/publishShow?id=' + this.data.userId,
    })
  },

  sendComment: function () {
    //如果已登录
    if (wx.getStorageSync('userId')) {

      var that = this;
      var time = this.getFormatTime();

      let content = this.data.inputMessage;
      //用户评论输入内容为空时弹出  
      if (content == '') {
        wx.showToast({
          title: '请输入内容', //提示内容       
          icon: 'none'
        })
        return {
          errCode: -1,
          msg: '输入为空'
        };
      } else if (content.length <= 1) {
        wx.showToast({
          title: '输入字数过少', //提示内容       
          icon: 'none'
        })
        return {
          errCode: -1,
          msg: '字数过少'
        };
      }

      let videoId = this.data.videoId;
      wx.cloud.callFunction({
        name: 'commentHandle',
        data: {
          action: 'postComment',
          content: content,
          newsId: videoId,
          date: time,
          userId: wx.getStorageSync('userId'),
        }
      }).then(res => {
        console.log(res);
        that.setData({
          inputMessage: '',
          textareaHeight: 40,
          scrollable: false,
          disableSubmit: true
        });
        that.getComments(videoId);

      })
        .catch(err => {
          console.log(err);
          return err;
        });

    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
    }
  },

  getFormatTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = this.formatNumber(now.getMonth() + 1);
    let day = this.formatNumber(now.getDate());
    let hour = this.formatNumber(now.getHours());
    let minute = this.formatNumber(now.getMinutes());
    let second = this.formatNumber(now.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },
  formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  },
})
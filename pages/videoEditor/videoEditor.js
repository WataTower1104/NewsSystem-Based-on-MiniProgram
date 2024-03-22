var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoUrl: "",
    poster: "",
    isUpload: true, //防重复点击 

    // >>>>>文字填充区所需变量START
    title: '',

    inputRecap: '',
    textareaHeight: 40,
    textLineCount: 1,
    scrollable: false,
    maxLength: 200,
    hasRecap: true
    // >>>>>文字填充区所需变量END

  },

  getTitle(event) {

    this.setData({
      title: event.detail.value
    });
  },

  //概括输入时执行，对文字填充区部分所需变量进行赋值
  onInput(e) {
    let value = e.detail.value;
    let lines = this.data.textLineCount;

    let height = lines > 5 ? 5 * 40 : lines * 40;
    let scrollable = lines > 5;

    this.setData({
      inputRecap: value,
      textareaHeight: height,
      scrollable: scrollable,
      hasRecap: value.trim().length === 0
    });
  },

  //概括输入时发生行高变化执行，判断是否限定行高
  isMaxHeight(e) {
    this.setData({
      textLineCount: e.detail.lineCount
    });
  },

  //删除已上传视频，TODO:清除已上传视频的缓存
  deleteVideo() {
    this.setData({
      videoUrl: '',
      isUpload: true
    });
  },

  //拍摄或选择视频
  chooseVideo() {
    this.setData({ isUpload: false });

    let that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed: false,
      success: res => {
        console.log("所上传的视频信息=>>>", res);
        let tempFilePath = res.tempFilePath//选择定视频的临时文件路径（本地路径）
        let size = parseFloat(res.size / 1024 / 1024).toFixed(1) //选定视频的数据量大小

        if (parseFloat(size) > 100) {
          that.setData({
            isUpload: true,
          })
          let beyondSize = parseFloat(size) - 100;

          //显示错误信息
          wx.showToast({
            title: '上传的视频大小超限，超出' + beyondSize + 'MB,请重新上传',
            icon: 'error'
          })
        } else {
          //显示成功信息
          wx.showToast({
            title: '视频添加成功！',
            icon: "success"
          });

          console.log("成功上传，暂存于=>>>", tempFilePath)
          that.setData({
            videoUrl: tempFilePath
          });
        }
      },
      fail: res => {
        that.setData({ isUpload: true });
        console.log('视频添加过程发生失败！=>>>', res);
      }
    })
  },

  isEmpty() {
    if (this.data.title === '')
      return {
        errcode: 0,
        msg: '视频标题为空'
      }
    else if (this.data.inputRecap === '')
      return {
        errcode: 0,
        msg: '新闻概述为空'
      }
    else if (this.data.videoUrl === '')
      return {
        errcode: 0,
        msg: '未上传视频'
      }
    else
      return {
        errcode: 1,
        msg: 'no empty'
      }
  },

  // 创建新的字段，获取视频的ID
  async getVideoId() {
    let that = this;
    try {
      let userId = wx.getStorageSync('userId');
      let result = await wx.cloud.database().collection('video-news').add({
        data: {
          _userId: userId,
          _date: that.getFormatTime(),
        }
      });
      console.log('video表新记录添加成功', result);
      return result._id;
    } catch (error) {
      console.log("video表新记录添加失败", error);
      return null;
    }
  },

  //上传缓存视频到云存储
  async uploadVideo() {
    let that = this;
    let now = new Date();
    let videoId = await that.getVideoId();
    let videoType = that.data.videoUrl.split(".")[1]

    if (videoId === null) {
      console.log('videoId返回为null')
      return null;
    }

    try {
      let res = await wx.cloud.uploadFile({
        filePath: that.data.videoUrl,
        cloudPath: `videos/${videoId}/${now.getTime()}.${videoType}`,
      })

      console.log('视频上传成功=>>>', res);
      return {
        videoId: videoId,
        videoPath: res.fileID
      }

    } catch (error) {
      console.log('上传失败=>>>', error);
      return null;
    }

  },

  //上传全部相关数据
  submitVideo() {
    let that = this;
    let isEmptyRes = that.isEmpty();

    //检测是否有空值
    if (!isEmptyRes.errcode) {
      wx.showToast({
        title: isEmptyRes.msg,
        icon: 'error'
      })
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定提交吗',
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '上传中...',
            mask: true //显示透明蒙层，防止触摸穿透
          });

          //处理上传
          that.uploadVideo().then(res => {

            if (res === null) {
              wx.hideLoading();
              console.log('uploadVideo函数返回null')
              return null;
            }

            wx.cloud.callFunction({
              name: 'videoHandle',
              data: {
                action: 'postVideo',
                id: res.videoId,
                title: that.data.title,
                recap: that.data.inputRecap,
                videoPath: res.videoPath,
              }
            }).then(res => {
              console.log('submit success', res);
              wx.hideLoading();
              wx.showToast({
                title: '上传成功！',
                icon: 'success'
              });
              wx.switchTab({
                url: '../index/index'
              });
            }).catch(err => {
              console.log('submit fail', err);
              wx.hideLoading();
              wx.showToast({
                title: '上传失败',
                icon: 'error'
              });
            })
          }).catch(err => {
            console.log('视频上传失败', err);
          })
        }

        if (res.cancel) {
          return {
            errCode: 0,
            msg: 'user cancel'
          }

        }
      }
    })





  },

  // 获得yyyy-mm-dd hh:mm:ss格式的时间
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

  //用户选择返回时进行询问
  onLoad: function () {
    wx.enableAlertBeforeUnload({
      message: "内容还未保存，是否退出当前页面？",
      success: function () {
        return true;
      },
      fail: function () {
        return false;
      },
    });
  },

})

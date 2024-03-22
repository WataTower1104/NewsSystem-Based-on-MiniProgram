// pages/my/editinfo/editinfo.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:'',
    userInfo: '',
    src_newavatar: '',
    src_avatar: '',
    showModalStatus: false,
    inputOldPassword : '',
    inputNewPassword_1 : '',
    inputNewPassword_2 : '',
  },

  
  // 获取用户信息
  getUserInfo(){
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"getUserInfo",
        userId: this.data.userId
      }
      }).then(result => {
        this.setData({
          userInfo: result.result,
          src_avatar: result.result._avatar
                });
      // 其他操作
      }).catch(error => {
        console.log(error);
      // 其他操作
      })
  },


  // 插入图片
  updateavatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['origin'],
      success: res => {
        wx.showLoading({
          title: '正在上传图片',
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
        console.log(res.tempFiles[0].tempFilePath)
        this.setData({
          src_newavatar: res.tempFiles[0].tempFilePath
        })
        this.setData({
          // userInfo_avatar : res.tempFilePath
          src_avatar: res.tempFiles[0].tempFilePath
        })
        this.getCloudImgUrl(res.tempFiles[0].tempFilePath,this.data.userInfo._id).then(res => {
          let tempinfo = this.data.userInfo;
          tempinfo._avatar = res;
          this.updateinfo(tempinfo).then(res => {
            if(result.result.errCode != 1){
              wx.showToast({
                title: '上传时发生错误',
                icon: 'error',
                duration: 1500
              })
            }
            else{
              wx.showToast({
                title: '头像修改成功！',
                icon: 'success',
                duration: 1500
              })
              this.setData({
                src_avatar: res,
                userInfo : tempinfo
              })
            }
          });
        })

      },
      fail: res => {
        console.log('选择图片功能加载失败', res);
        wx.showToast({
          title: '功能加载失败',
          icon: 'error',
          duration: '1500'
        })
      }
    })
  },

  goToupdatename(){
    wx.navigateTo({
      url: '/pages/my/editinfo/updatename/updatename'
    })
  },
  goToupdatepassword(){
    wx.navigateTo({
      url: '/pages/my/editinfo/updatepassword/updatepassword'
    })
  },

  // 图片路径转换
  async getCloudImgUrl(tempUrl, userId) {
    try {
      let now = new Date();
      console.log(tempUrl)
      let res = await wx.cloud.uploadFile({
        cloudPath: `Users/${userId}/${now.getTime()}.png`,
        filePath: tempUrl,
      });
      console.log('图片上传成功', res);
      return res.fileID;
    } catch (error) {
      console.log('图片上传失败', error);
    }
  },
  
  // 上传更新的个人信息
  async updateinfo(tempinfo){
    let result = await wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"updateInfo",
        userInfo: tempinfo
      }
      });
    return result;
  },

  // 更改名字
  editname(){
    wx.showModal({
      editable:true,//显示输入框
      placeholderText:this.data.userInfo._userName,//显示输入框提示信息
      title: '更改名字',
      success: res => {
        if (res.confirm) { //点击了确认
          if(res.content.replace(/\s+/g, '').length == 0 ){
            wx.showToast({
              title: '输入为空！',
              icon: 'error',
              duration: 1500
            });
            return;
          }

          let tempinfo = this.data.userInfo;
          tempinfo._userName = res.content;
          this.updateinfo(tempinfo).then(res => {
            if(res.result.errCode == -2){
              wx.showToast({
                title: '名字重复！',
                icon: 'error',
                duration: 1500
              });
            }
            else{
              this.setData({
                userInfo : tempinfo
              })
              wx.showToast({
                title: '名字修改成功！',
                icon: 'success',
                duration: 1500
              })
            }
          });
          

        } else {
          console.log('用户点击了取消')
        }
      }
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.data.userId = wx.getStorageSync('userId');
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },


// 以下函数均用于实现修改密码功能
  inputOldPassword(event) { //输入原密码
    this.data.inputOldPassword = event.detail.value
    // console.log("inputOldPassword", event.detail.value)
  },
  inputNewPassword_1(event) { //输入新密码
    this.data.inputNewPassword_1 = event.detail.value
    // console.log("inputNewPassword_1", event.detail.value)
  },
  inputNewPassword_2(event) { //再次输入新密码
    this.data.inputNewPassword_2 = event.detail.value
    // console.log("inputNewPassword_2", event.detail.value)
  },
  update: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  updatePassword(){
    if(this.data.inputOldPassword!=this.data.userInfo._password){
      wx.showToast({
        title: '原密码不正确',
        icon: 'error',
        duration: 1500
      })
      return
    }
    if(this.data.inputNewPassword_1.length<8){
      wx.showToast({
        title: '密码过短',
        icon: 'error',
        duration: 1500
      })
      return
    }
    if(this.data.inputNewPassword_1!=this.data.inputNewPassword_2){
      wx.showToast({
        title: '两次密码不一致',
        icon: 'error',
        duration: 1500
      })
      return
    }
    let tempinfo = this.data.userInfo;
    tempinfo._password = this.data.inputNewPassword_2;
    this.updateinfo(tempinfo).then(res => {
      if(res.result.errCode == -2){
        wx.showToast({
          title: '修改时发生错误',
          icon: 'error',
          duration: 1500
        })
      }
      else{
        this.setData({
          userInfo : tempinfo
        })
        wx.showToast({
          title: '密码修改成功！',
          icon: 'success',
          duration: 1500
        })
      }
  
      // 密码修改成功，收起修改密码窗口
      this.util("close")
    });
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例  
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });
    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;
 
    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();
 
    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })
 
    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })
      //关闭 
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
    // 显示 
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },


})
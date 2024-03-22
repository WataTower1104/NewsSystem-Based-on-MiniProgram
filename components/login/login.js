// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    username:'',
    password:''
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 用于获取用户名
    getUserName:function(e){
      this.setData({
        username: e.detail.value
      })
    },

    // 用于获取密码
    getPassword:function(e){
      this.setData({
        password: e.detail.value
      })
    },

    // 用于判断是否漏填
    isEmpty:function(){
      if(this.data.username === ''){
        return {
          errCode:-11,
          msg:'用户名为空'
        }
      }
      else if(this.data.username.length > 10){
        return {
          errCode:-13,
          msg:'用户名过长'
        }
      }
      else if(this.data.password === ''){
        return {
          errCode:-14,
          msg:'密码为空'
        }
      }
      else if(this.data.password.length < 8){
        return {
          errCode:-15,
          msg:'密码过短'
        }
      }
      else if(this.data.password.length > 18){
        return {
          errCode:-16,
          msg:'密码过长'
        }
      }
      else{
        return {
          errCode:1,
          msg:'无漏填'
        }
      }
    },

    // 登录函数
    login:function(){
      let isEmpty =this.isEmpty()
      if(isEmpty.errCode != 1){
        wx.showToast({
          title: isEmpty.msg,
          icon:"error"
        })
        return null;
      }

      let that = this;
      wx.cloud.callFunction({
        name:'userHandle',
        data:{
          action:'login',
          userName:that.data.username,
          password:that.data.password
        }
      }).then(res => {
        if(res.result.errCode != 1){
          wx.showToast({
            title: res.result.msg,
            icon:"error"
          })
        }
        else{
          wx.setStorageSync('userId',res.result.userId)
          that.triggerEvent('updateStorage', res.result.userId)
          wx.showToast({
            title: '登录成功！',
            icon: 'success'
          });
          this.triggerEvent('getNum')
          this.triggerEvent('getUserName')
        }
        console.log(res.result.userId);
      }).catch(err => {
        console.log('Something error occur=>>>' + err)
      })
    },

    // 注册函数
    register:function(){
      let isEmpty =this.isEmpty()
      if(isEmpty.errCode != 1){
        wx.showToast({
          title: isEmpty.msg,
          icon:"error"
        })
        return null;
      }

      let that = this;
      wx.cloud.callFunction({
        name:'userHandle',
        data:{
          action:'register',
          userName:that.data.username,
          password:that.data.password
        }
      }).then(res => {
        if(res.result.errCode != 1){
          wx.showToast({
            title: res.result.msg,
            icon:"error"
          })
        }
        else{
          that.triggerEvent('updateStorage', res.result.userId)
          wx.showToast({
            title: '注册成功！',
            icon: 'success'
          });
          wx.setStorageSync('userId',res.result.userId)
          
          this.triggerEvent('getNum')
          this.triggerEvent('getUserName')
        }
        console.log(res);
      }).catch(err => {
        console.log('Something error occur=>>>' + err)
      })
    },
  }
})

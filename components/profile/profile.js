// components/me/me.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    username : String,
    numofCollections : String,
    numofHistory : String,
    avatar : String
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },


  /**
   * 组件的方法列表
   */
  methods: {
    outLogin(){
      wx.clearStorageSync()
      this.triggerEvent('updateStorage','')
      wx.navigateTo({
        url: '/pages/login/login'
      })
    },
    goToCollection(){
      wx.navigateTo({
        url: '/pages/myCollection/myCollection'
      })
    },
    goToHistory(){
      wx.navigateTo({
        url: '/pages/myHistory/myHistory'
      })
    }
  },


 /**
   * 生命周期函数
   */
  lifetimes:{
    attached(){
      // this.triggerEvent('updateStorage','')
      // this.triggerEvent('getNum','')
      // this.triggerEvent('getUserName','')
    }
  }
})




//index.js
import util, {
  uuid
} from '../../utils/util'
import {
  login,
  isUploadCollectionQRCode
} from '../../utils/user'


Page({
  data: {
    showLoginDialog: false,
    isUploadQRCode: false,
    isLogin: false, //控制生成二维码按钮是否可点击
    userInfo: {},
    errorMsg: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
 
  onLoad: function () {
    this.initPage()
  },
  onShow: function () {
    this.initPage()
  },
  initPage: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    console.log('---初始化', userInfo);
    if (util.isEmpty(userInfo)) {
      this.setData({
        isLogin: false
      })
      // 显示登录引导弹框
      this.showLoginDialog();
    } else {
      this.setData({
        userInfo,
        isLogin: false
      })
    }
  },

  // 显示登录引导弹框
  showLoginDialog: function () {
    // 直接走登录，显示授权弹框
    this.setData({
      showLoginDialog: true
    })
  },
  // 隐藏登录引导弹框
  hideLoginDialog: function () {
    this.setData({
      showLoginDialog: false
    })
  },
  // 获取用户信息并登陆
  getUserInfoAndLogin: function (e) {
    const newUserInfo = e.detail.userInfo
    const {
      userInfo,
      isLogin
    } = this.data
     console.log(isLogin, '----获取用户信息并登陆', userInfo)

    // 若拒绝授权用户信息
    if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
      return;
    }
    // 若未登录
    if (!isLogin || util.isEmpty(userInfo)) {
      wx.showLoading('登录中')
      login()
        .then(() => {
          wx.hideLoading();
          //是否上传收款二维码
          isUploadCollectionQRCode().then(res => {
            console.log("---查询是否上传兑奖二维码结果", res);
            this.setData({
              isUploadQRCode : res
            });
          });
          this.setData({
            userInfo: newUserInfo,
            isLogin: true
          });
        }).catch(() => {
          wx.hideLoading()
        })
    }
  },
  uploadCollectionQRCode : function() {
    console.log("---上传兑奖二维码");
    this.setData({
      isUploadQRCode : true
    });
  }
})
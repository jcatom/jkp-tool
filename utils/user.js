
/**
 * 用户相关服务
 */
const Promise = require('../plugins/es6-promise/dist/es6-promise.min.js')
const util = require('./util.js');
const api = require('./api.js');

/**
 * Promise封装wx.login 
 */
function login() {
  return new Promise(function (resolve, reject) {
    // wx.login 接口获得的用户登录态拥有一定的时效性,用户越久未使用小程序，用户登录态越有可能失效
    wx.login({
      success: rs => {
        // 拿到用户登录凭证code
        if (rs.code) {
          var params = {
            code: rs.code
          }
          // 请求登录接口，将code传给后台
          api.authLoginweixin(params)
            .then(res => {
              //登录成功
              util.success(res.msg)

              // 获取用户信息
              wx.getUserInfo({
                success: (res2) => {
                  //用户已经授权过，获取userInfo
                  var userInfo = res2.userInfo

                  //存储用户信息
                  wx.setStorageSync('userInfo', userInfo);
                  
                  // 更新微信昵称和头像接口
                  api.updateUserInfo({ nick_name: userInfo.nickName, avatar_url: userInfo.avatarUrl }).catch((err) => { console.log('---更新失败：微信昵称和头像', err) })
                  resolve && resolve()
                }
              })
            })
            .catch(res => {
              //清除同步缓存
              wx.clearStorageSync()
              reject && reject()
            })

        } else {
          //wx.login接口登录失败
          util.error('登录失败')
        }
      },
      fail: err => {
        util.error('网路开小差，请稍后再试')
      }
    })
  })

}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('token')) {
      // 检验当前用户的session_key是否有效
      wx.checkSession({
        success: function () {
          // console.log("当前处于登录状态");
          resolve && resolve();
        },
        fail: function () {
          // console.log("需要重新登录");
          //清除同步缓存
          wx.clearStorageSync()
          reject && reject();
        }
      })
    } else {
      reject && reject();
    }
  });
}

function isUploadCollectionQRCode() {
  return new Promise(function(resolve, reject) {
    api.isUploadCollectionQRCode().then(res => {
      console.log("---查询是否上传兑奖二维码成功", res);
      resolve && resolve(res.data);
    }).catch(res => {
      console.log("---查询是否上传兑奖二维码失败", res);
      reject && reject();
    }) ;
  });
}

module.exports = {
  login,
  checkLogin,
  isUploadCollectionQRCode
};
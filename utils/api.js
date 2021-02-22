const http = require('./handleRequest.js')
 const api_host = "http://127.0.0.1:9000/" //测试环境 appId:wx67eb07b5945e529f
//const api_host = "https://appapi.guangxifczs.com/api" //线上 appId:wxd66eb3198ec1dae3

const {
  PostMethod,
  GetMethod,
  PutMethod,
  DeleteMethod
} = http
/*
 * http.PostMethod Post请求
 * http.GetMethod Get请求
 * http.PutMethod 新增请求
 * http.DeleteMethod 删除请求
 * */
module.exports = {
  //登录
  authLoginweixin: (params) => GetMethod(api_host + '/100001', { key: '100001', ...params }), 
  // 更新微信昵称和头像
  updateUserInfo: (params) => PostMethod(api_host + '/100002', { key: '100002', ...params }),
  // 查询是否已上传收款二维码
  isUploadCollectionQRCode: (params) => GetMethod(api_host + '/100004', {key: '100004', ...params})
}; 
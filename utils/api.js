const http = require('./handleRequest.js')
// const api_host = "http://222.212.94.34:31004/api" //测试环境 appId:wx67eb07b5945e529f
const api_host = "https://appapi.guangxifczs.com/api" //线上 appId:wxd66eb3198ec1dae3

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
  authLoginweixin: (params) => GetMethod(api_host, { key: '100201', ...params }), //登录
  updateUserInfo: (params) => PostMethod(api_host + '/100203', { key: '100203', ...params }), // 更新微信昵称和头像
  createQrCode: (params) => PostMethod(api_host + "/100202", { key: '100202', ...params },{},true), // 选号下单
  queryOrderList: (params) => GetMethod(api_host, { key: '101005', ...params }), // 查询订单列表
  queryOrderDetail: (params) => GetMethod(api_host, { key: '101505', ...params }), // 查询订单详情
}; 
const Promise = require('../plugins/es6-promise/dist/es6-promise.min.js')
const util = require('./util.js')

/**
 * 微信请求 http 封装
 * @param url 请求路径
 * @param params 请求参数
 */
const http = (url, params, method, header = {}, hideMsg = false) => {
    params = {
        ...params,
        tag_from: '1500'
    } //tag_from：渠道(1500)
    let loginToken = ''
    if (wx.getStorageSync('token')) {
        loginToken = wx.getStorageSync('token')
    } else {
        loginToken = util.uuid()
        //存储token
        wx.setStorageSync('token', loginToken)
    }


    // 开始请求
    wx.showLoading({
        title: '加载中...',
    })
    return new Promise((resolve, reject) => {
        wx.request({
            url: url + params.key,
            method: method,
            data: params,
            header: {
                'Content-Type': 'application/json',
                'lg-session-id': loginToken,
                ...header
            },
            success: (res) => {
                wx.hideLoading()

                if (res.statusCode === 400) {
                    util.error('参数异常')
                    return;
                } else if (res.statusCode === 401) {
                    util.error('参数错误')
                    return;
                } else if (res.statusCode === 404) {
                    util.error('接口路径异常')
                    return;
                } else if (res.statusCode === 500) {
                    util.error('服务器异常')
                    return;
                } else if (res.statusCode === 502) {
                    util.error('请求响应无效')
                    return;
                } else if (res.statusCode === 504) {
                    util.error('网关超时')
                    return;
                }

                // console.log('request res: ' ,res)

                //若请求成功
                if (res.statusCode === 200) {
                    /*code为1  正常数据*/
                    if (res.data && `${res.data.code}` === "1") {
                        resolve && resolve(res.data)
                    } else {
                        // 错误信息提示
                        !hideMsg && util.error(res.data.msg)
                        reject && reject(res.data);
                    }
                }
            },
            fail: (error) => {
                console.log('error: ', error)
                wx.hideLoading()
                util.error('网路开小差，请稍后再试')
            },
        })
    })
}



module.exports = {
    PostMethod: (url, params, headers, hideMsg) => {
        // console.log(http(url, params, "POST", headers, hideMsg),'---http post')
        return http(url, params, "POST", headers, hideMsg)
    },
    GetMethod: (url, params, headers, hideMsg) => {
        return http(url, params, "GET", headers, hideMsg)
    },
    PutMethod: (url, params, headers) => {
        return http(url, params, "PUT", headers)
    }, //PUT 方法封装（新增数据）
    DeleteMethod: (url, params, headers) => {
        return http(url, params, "DELETE", headers)
    } //DELETE 方法封装（删除数据）
}
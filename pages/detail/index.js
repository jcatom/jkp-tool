var QRCode = require("../../utils/weapp-qrcode.js")
import api from '../../utils/api.js'
import util from '../../utils/util.js'
import {
  handleOneBetData
} from '../../utils/util.js'
import {
  $wuxDialog
} from '../../wux-weapp/dist/index'
// pages/test/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareImg: '', //分享图片的地址
    qrcodePath: '', //二维码地址
    qrcodeWidth: 220, //二维码的宽（px）
    post_cover: '../../img/qrresult/bg.png',
    cover: '../../img/qrresult/bg.png', //封面图地址
    coverWidth: 660, //封面图的宽(rpx)
    coverHeight: 825, //封面图的高(rpx)
    width: wx.getSystemInfoSync().windowWidth, //屏幕的宽
    height: wx.getSystemInfoSync().windowHeight, //屏幕的高
    detail: { // 海报图的的一些信息，从后台请求的数据
      "project_id": "", //方案ID
      "random_code": "", //取票码
      "lot_id": '',
      "play_id": '',
      "total_amount": '',
      'storage_time': '',
      'bet_number': '',
    },
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '二维码生成中',
    })
    let detail = options.data ? JSON.parse(options.data) : {}
    console.log(detail, "----detail 详情信息")
    // 若是来自首页选号下单，则需查询详情
    if (detail.isFromIndex) {
      // 根据方案id查详情 (获取时间)
      api.queryOrderDetail({
          lot_code: detail.lot_code,
          project_id: detail.project_id
        })
        .then(res => {
          const data = res.data || {}
          detail = {
            ...detail,
            ...data
          }
          handleOneBetData(detail)
          console.log(detail, "----detail 根据方案id查详情")
          this.setData({
            detail
          })
        })
    }

    this.setData({
      detail
    }, () => {
      // 生成二维码
      this.createQRCode()
    })
  },
  // 生成二维码
  createQRCode: function () {
    const {
      detail,
      qrcodeWidth
    } = this.data
    const qrcode = new QRCode('qrcode', {
      text: detail.random_code || '', //取票码
      width: qrcodeWidth,
      height: qrcodeWidth,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    setTimeout(() => {
      wx.hideLoading()
      // 开始生成图片
      this.createPics()
    }, 500)
  },
  // 生成图片
  createPics: function () {


    // 将二维码的canvas图片，转为真实图片
    wx.canvasToTempFilePath({
      canvasId: 'qrcode',
      success: (res) => {
        // 二维码临时路径
        this.setData({
          qrcodePath: res.tempFilePath
        }, () => {
          // 根据以上信息开始画图
          this.createdCode()
          //canvas画图需要时间而且还是异步的，所以加了个定时器
          setTimeout(() => {
            // 将生成的canvas图片，转为真实图片
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              canvasId: 'pic-container',
              success: (res) => {
                // 绘图完毕
                let shareImg = res.tempFilePath;
                this.setData({
                  shareImg: shareImg,
                })
              },
              fail: (res) => {
                // util.error("图片生成失败！")
              }
            })
          }, 500)

        })
      },
      fail: (res) => {
        console.log(res, "---error 二维码临时路径生成失败")
      }
    }, this)
  },
  //开始绘图
  createdCode: function () {
    const ctx = wx.createCanvasContext('pic-container'); //绘图上下文
    let {
      detail,
      width,
      height,
      coverWidth,
      coverHeight,
      qrcodeWidth
    } = this.data
    detail = detail ? detail : {}
    // 绘制 封面图并裁剪（这里图片确定是按100%宽度，同时高度按比例截取，否则图片将会变形）
    // 裁剪框的大小，即需要图片的大小 660 * 825 (canvas使用单位 px)
    console.log(width, height, coverWidth, coverHeight, '---cover')
    coverWidth = coverWidth / 2.1
    coverHeight = coverHeight / 2.1
    const leftDistance = (width - coverWidth) / 2


    // 绘制内容
    const titleX = leftDistance + 15
    const titleY = coverHeight + 30
    const valueX = leftDistance + 60
    //投注内容数组（用于计算高度）
    const arr = detail.bet_number_arr ? detail.bet_number_arr : []
    // const num_count = 3
    // let arr = tmpArr.filter((item) => !util.isEmpty(item))
    // const len = arr.length
    // arr = arr.slice(0, num_count)
    // if (len > num_count) {
    //   arr[arr.length - 1] += " ..."
    // }

    // 白色内容背景
    this.roundRect(ctx, leftDistance, coverHeight - 10, coverWidth, 100 + (arr.length) * 30, 10, '#fff')

    ctx.setFontSize(16);
    ctx.setFillStyle('#999')
    ctx.fillText('内容：', titleX, titleY);
    ctx.setFillStyle('#333')
    let numberBottomY = titleY
    arr && arr.map((num, i) => {
      numberBottomY = titleY + 30 * i
      ctx.fillText(num, valueX, numberBottomY);
    })

    ctx.setFillStyle('#999')
    ctx.fillText('总额：', titleX, numberBottomY + 30);
    ctx.fillText('时间：', titleX, numberBottomY + 60);
    ctx.setFillStyle('#333')
    ctx.fillText(detail.total_amount || '' + '元', valueX, numberBottomY + 30);
    ctx.fillText(detail.storage_time || '', valueX, numberBottomY + 60);

    // 绘制背景图
    ctx.drawImage(this.data.cover, leftDistance, 0, coverWidth, coverHeight);
    // 绘制标题
    const title = detail.playName || ''
    ctx.setFillStyle('#333')
    ctx.setFontSize(16)
    ctx.fillText(title, leftDistance + 110, 60);
    ctx.setFillStyle('#999')
    ctx.setFontSize(12)
    ctx.fillText('( 玩法 )', leftDistance + 110, 80);

    // 绘制二维码 
    ctx.drawImage(this.data.qrcodePath, leftDistance + 57, 110, qrcodeWidth, qrcodeWidth);

    ctx.draw()
  },
  /**
   * 绘制圆角矩形 r 圆角的半径
   */
  roundRect: function (ctx, x, y, w, h, r, fill, stroke) {
    // 开始绘制
    ctx.beginPath()
    // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
    // 这里是使用 fill 还是 stroke都可以，二选一即可
    fill && ctx.setFillStyle(fill)
    stroke && ctx.setStrokeStyle(stroke)
    // 左上角
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)

    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    fill && ctx.fill()
    stroke && ctx.stroke()
    ctx.closePath()
  },

  // 保存图片到本地
  saveImg: function () {
    // 获取用户是否开启用户授权相册
    wx.getSetting({
      success: (res) => {
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.downImg()
            },
            fail: () => {
              // 如果用户拒绝过或没有授权，则再次打开授权窗口
              //（ps：微信api又改了现在只能通过button才能打开授权设置，以前通过openSet就可打开）
              $wuxDialog().open({
                title: '授权相册',
                content: '是否打开授权设置？',
                buttons: [{
                    text: '取消',
                  },
                  {
                    text: '确定',
                    type: 'primary',
                    openType: 'openSetting',
                  },
                ],
              })
            }
          })
        } else {
          // 有授权则直接保存
          this.downImg()
        }
      }
    })
  },
  downImg: function () {
    wx.showLoading({
      title: '图片保存中',
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImg,
      success: () => {
        wx.hideLoading()
        util.success('保存成功')
      },
      fail: () => {
        wx.hideLoading()
        util.error('保存失败')
      }
    })
  },
  // 分享朋友
  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      console.log(res, '---res')
    }
    return {
      title: '快速生成号码，快来加入游戏吧！',
      path: '/pages/index/index', //被分享的人点击进来之后的页面
      imageUrl: this.data.shareImg, //这里是图片的路径
    }
  },
})
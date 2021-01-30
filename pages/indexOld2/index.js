//index.js
import api from '../../utils/api'
import util from '../../utils/util'
import {
  login
} from '../../utils/user'


Page({
  data: {
    lot_id: '50',
    currentTab: 0, //当前tab
    textValue: '',
    oldTextValue: '',
    textValueArr: [],
    showDialog: false,
    showDTDialog: false,
    showLoginDialog: false,
    checked: false,
    showDialogTextArr: [],
    isLogin: false, //控制生成二维码按钮是否可点击
    userInfo: {},
    example: [
      [{
          value: '8,9,18,20,27,33|14+5',
          remark: '直选5倍'
        },
        {
          value: '8 9 10 20 21 23-6+5',
          remark: '直选5倍'
        },
        {
          value: '2,9,10#22,25,26,27|10+5',
          remark: '胆拖5倍'
        },
        {
          value: '3,11,4#24,25,26,27-6+5',
          remark: '胆拖5倍'
        }
      ],
      [{
          value: '8,9,11,20,21,23,28+5',
          remark: '直选5倍'
        },
        {
          value: '3-8-15-20-24-28-30+5',
          remark: '直选5倍'
        },
        {
          value: '12,26#2,13,14,17,22,24+5',
          remark: '胆拖5倍'
        },
        {
          value: '8,9#18-19-20-21-23-31+5',
          remark: '胆拖5倍'
        }
      ],
      [{
          value: '1|2|3,4+5',
          remark: '直选5倍'
        },
        {
          value: '1-2-3+5',
          remark: '直选5倍'
        },
        {
          value: '2,4,5+5',
          remark: '组选5倍'
        }
      ],
    ],
    errorMsg: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  onLoad: function () {
    this.initPage()
  },
  initPage: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    console.log('---初始化', userInfo)

    if (util.isEmpty(userInfo)) {
      this.setData({
        isLogin: false
      })
      this.showLoginDialog()
    } else {
      this.setData({
        userInfo,
        isLogin: true
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
    // console.log(isLogin, '----获取用户信息并登陆', userInfo)

    // 若拒绝授权用户信息
    if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
      return;
    }
    // 若未登录
    if (!isLogin || util.isEmpty(userInfo)) {
      wx.showLoading('登录中')
      login()
        .then(() => {
          wx.hideLoading()
          this.setData({
            userInfo: newUserInfo,
            isLogin: true
          })
        })
        .catch(() => {
          wx.hideLoading()
        })
    }
  },
  //  tab切换
  swichNav: function (e) {
    const tab = e.target.dataset.current
    // 若是重复点击
    if (this.data.currentTab === tab) {
      return false;
    } else {
      let lotId = 50;
      if (tab == 0) {
        //游戏1 
        lotId = 50;
      } else if (tab == 1) {
        //游戏2
        lotId = 56;
      } else if (tab == 2) {
        //游戏3
        lotId = 51;
      }
      this.setData({
        currentTab: tab,
        lot_id: lotId,
        textValue: '',
        textValueArr: []
      })
    }
  },
  // 输入框改变(自带粘贴功能)
  onInputChange: function (e) {
    const {
      value
    } = e.detail
    this.setData({
      textValue: value
    }, () => {
      this.validateInput()
      this.formatTextarea()
    })
  },
  // 检查输入的数字是否规范
  checkNumber: function (num, type = 'red') {
    num = ~~num
    const tab = this.data.currentTab
    switch (tab) {
      case 0: //游戏1
      case 1: //游戏2
      case 2: //游戏3
        if (type === 'red') {
          if (num >= 1 && num <= 33) {
            return true
          } else {
            return false
          }
        } else {
          if (num >= 1 && num <= 16) {
            return true
          } else {
            return false
          }
        }
        default:
          return true
    }
  },
  // 验证输入值是否正确
  validateInput: function () {
    const {
      textValue
    } = this.data
    let errorMsg = ''
    // 检查是否出现字母、汉字
    const reg = new RegExp('[A-z\u4e00-\u9fa5]', 'ig')
    if (textValue && reg.test(textValue)) {
      errorMsg = '注：输入字符不规范哦！'
    }

    // 检查所有数字
    const numArr = textValue.match(/[0-9]+/g)
    if (Array.isArray(numArr)) {
      numArr.map(number => {
        if (!this.checkNumber((number), 'red')) {
          errorMsg = '注：数字不正确哦！'
        }
      })
    }
    this.setData({
      errorMsg
    })
  },
  // 使用号码示例
  copyText: function (e) {
    let {
      textValue
    } = this.data
    const text = e.target.dataset.text
    if (textValue) {
      textValue += '\n' + text
    } else {
      textValue = text
    }
    this.setData({
      textValue
    }, () => {
      this.formatTextarea()
    })
  },

  //确认提交
  confirmSubmit: function (e) {
    if (!this.data.isLogin) {
      // 显示登录引导弹框
      this.showLoginDialog()
      return;
    }

    let {
      textValue,
      errorMsg
    } = this.data
    if (util.isEmpty(textValue)) {
      errorMsg = '注：请输入内容！'
      this.setData({
        errorMsg
      })
      return;
    }
    if (errorMsg) {
      return;
    }

    // 显示确认弹框
    this.toggleDialog()
  },
  // 格式化每一行
  formatSingleLineStr(str) {
    // 优先级最高（兼容中文格式符号）： -—+﹢#|｜
    const reg = /(?:[,，\s]*(?:([\-—+﹢#|｜])[,，\s]*)+[,，\s]*)|([,，\s]+)/g;
    let match = null;
    let outputStr = "";
    let startIdx = 0;
    while ((match = reg.exec(str))) {
      const [, $1, $2] = match;
      if ($1) {
        // 起始位置
        outputStr += str.slice(startIdx, match.index) + $1;
      } else if ($2) {
        outputStr += str.slice(startIdx, match.index) + ",";
      }
      startIdx = reg.lastIndex
    }
    if (startIdx < str.length) {
      outputStr += str.slice(startIdx)
    }
    return outputStr;
  },
  // 格式化多行
  formatMultipleLineText(textValue, closeHr = false) {
    let textValueArr = textValue.split("\n")
    // 若需要关闭空行
    if (closeHr) {
      textValueArr = textValueArr.filter(item => !util.isEmpty(item))
    }
    // 兼容处理所有格式  1,， 2, 3, 4  5 , 6, | 7, + 3
    textValueArr = textValueArr.map(item => {
      return this.formatSingleLineStr(item.trim())
    })
    return textValueArr
  },
  // 格式化Textare
  formatTextarea(e) {
    let {
      checked,
      oldTextValue,
      textValue
    } = this.data
    if (e) {
      checked = !checked
    }
    // 若需要格式化
    if (checked) {
      oldTextValue = textValue
      const multipleLineTextArr = this.formatMultipleLineText(textValue);
      this.setData({
        oldTextValue,
        textValue: multipleLineTextArr.join('\n'),
        textValueArr: multipleLineTextArr
      })
    }
    this.setData({
      checked
    })
  },
  // 生成二维码确认弹框
  toggleDialog: function () {
    const {
      textValue
    } = this.data
    const multipleLineTextArr = this.formatMultipleLineText(textValue,true);
    this.setData({
      textValueArr: multipleLineTextArr,
      showDialog: !this.data.showDialog,
    });
  },
  // 胆拖提示
  toggleDTDialog: function () {
    this.setData({
      showDTDialog: !this.data.showDTDialog
    });
  },
  // 生成二维码
  createQrCode: function () {
    // 关闭确认弹框
    this.toggleDialog()
    const {
      textValueArr
    } = this.data
    const bet_number = textValueArr.join("$")
    const params = {
      lot_id: this.data.lot_id,
      bet_number
    }
    // 生成二维码（生成订单）
    api.createQrCode(params)
      .then(res => {
        const data = res.data || {}
        // 组装详情数据
        const params = {
          ...data,
          lot_code: data.lot_id,
          bet_project_id: data.project_id,
          bet_number,
          total_amount: data.total_amt,
          isFromIndex: true
        }
        // 跳转详情
        wx.navigateTo({
          url: '/pages/detail/index?data=' + JSON.stringify(params),
        });
      })
      .catch(res => {
        const errorMsg = res.msg
        this.setData({
          errorMsg
        })
      })
  },
  // 跳转记录列表
  toRecordList: function () {
    wx.navigateTo({
      url: '/pages/record/index?lot_id=' + this.data.lot_id
    });
  }
})
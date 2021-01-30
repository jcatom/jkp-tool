//index.js
import api from '../../utils/api'
import util, {
  uuid
} from '../../utils/util'
import {
  login
} from '../../utils/user'


Page({
  data: {
    lot_id: '50',
    currentTab: 0, //当前tab
    tempTab: '',
    textValue: '',
    oldTextValue: '',
    textValueArr: [],
    confirmArr: [],
    showDialog: false,
    showDTDialog: false,
    showTabDialog: false,
    showLoginDialog: false,
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
    //存储全局tab信息
    const currentTab = wx.getStorageSync('tab')||0
    this.setData({currentTab})
    console.log('---初始化', userInfo)
    if (util.isEmpty(userInfo)) {
      this.setData({
        isLogin: false
      })
      // 显示登录引导弹框
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
      if(this.data.tempTab!==tab){
        this.toggleTabDialog()
        this.setData({
          tempTab: tab
        })
      }
    }
  },
  // 切换Tab提示弹框
  toggleTabDialog() {
    const showTabDialog=!this.data.showTabDialog
    if(!showTabDialog){
      this.setData({tempTab:''})
    }
    this.setData({
      showTabDialog
    });
  },
  // 确认切换tab：清空选号篮
  confirmChangeTab() {
    const tab = this.data.tempTab
    let lotId = util.getLotIdByTab(tab)
    //存储全局tab信息
    wx.setStorageSync('tab', tab);
    //存储全局选号信息
    wx.setStorageSync('lotteryList', []);
    this.setData({
      currentTab: tab,
      lot_id: lotId,
      textValue: '',
      textValueArr: [],
      errorMsg: ''
    })
    this.toggleTabDialog()
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
    })
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
  // 格式化游戏3每一行
  format3DSingleLineStr(str) {
    const reg = /((?:[,，]*[\-|\s][,，]*)+)|([,，]+)/g;
    let match = null;
    let outputStr = '';
    let startIdx = 0;
    while ((match = reg.exec(str))) {
      const [, $1, $2] = match;
      if ($1) {
        // 起始位置
        outputStr += str.slice(startIdx, match.index) + '|';
      } else if ($2) {
        outputStr += str.slice(startIdx, match.index) + ',';
      }
      startIdx = reg.lastIndex;
    }
    if (startIdx < str.length) {
      outputStr += str.slice(startIdx);
    }
    return outputStr;
  },
  formatMultipleLineText(textValue, closeHr = false) {
    let textValueArr = textValue.split("\n")
    // 若需要关闭空行
    if (closeHr) {
      textValueArr = textValueArr.filter(item => !util.isEmpty(item))
    }
    const {
      currentTab
    } = this.data
    // 兼容处理所有格式  1,， 2, 3, 4  5 , 6, | 7, + 3
    textValueArr = textValueArr.map(item => {
      if (currentTab == 2) {
        return this.format3DSingleLineStr(item.trim())
      }
      return this.formatSingleLineStr(item.trim())
    })
    return textValueArr
  },

  // 添加到选号篮(格式化+验证)
  addPickNum() {
    if (!this.data.isLogin) {
      // 显示登录引导弹框
      this.showLoginDialog()
      return;
    }
    let {
      textValue,
      errorMsg,
      currentTab
    } = this.data
    if (util.isEmpty(textValue)) {
      errorMsg = '注：请输入内容！'
      this.setData({
        errorMsg
      })
      return;
    }

    // 格式化
    let multipleLineTextArr = this.formatMultipleLineText(textValue, true);
    // 去掉倍数
    multipleLineTextArr = multipleLineTextArr.map(item => {
      const arr = item.split("+")
      return arr[0]
    })

    // 组装并验证
    const confirmArr = [] //正确数组
    const textValueArr = [] //错误数组
    multipleLineTextArr.map(num => {
      // 组装初步对象
      const obj = {
        lotCode: util.getLotIdByTab(currentTab),
        id: uuid(),
        num,
        zs: 1
      }
      // 验证一行
      let newObj = {}
      if (obj.lotCode === '50') {
        newObj = util.checkSsq(obj)
      }
      if (obj.lotCode === '56') {
        newObj = util.checkQlc(obj)
      }
      if (obj.lotCode === '51') {
        newObj = util.checkFc3d(obj)
      }
      // console.log(newObj,'---newObj')

      if (!newObj.isError) {
        confirmArr.push(newObj)
      }
      textValueArr.push(newObj)
    })

    // 显示第一个错误信息
    for (let i in textValueArr) {
      if (textValueArr[i].isError) {
        errorMsg = '该行号码 ' + textValueArr[i].num + ' 格式不正确，请参考示例格式'
        break;
      }
    }

    //正确数组有值
    if (!util.isEmpty(confirmArr)) {
      // 显示确认选号弹框
      this.toggleDialog()
    } else {
      util.warning('没有可添加的号码哦！')
    }
    // console.log(confirmArr, '----confirmArr')

    this.setData({
      textValue: textValueArr.map(item => item.num).join('\n'),
      textValueArr,
      confirmArr,
      errorMsg,
    });
  },

  /**
   * 确认选号弹框
   */
  toggleDialog: function () {
    const showDialog = !this.data.showDialog
    if (!showDialog) {
      this.setData({
        confirmArr: []
      })
    }
    this.setData({
      showDialog
    });
  },

  // 确认选号
  confirmPickNum() {
    let {
      textValueArr,
      confirmArr
    } = this.data
    // 从文本框中删除添加的号码
    textValueArr = textValueArr.filter(item => {
      return confirmArr.findIndex(i => i.id === item.id) === -1
    })
    this.setData({
      textValue: textValueArr.map(item => item.num).join('\n'),
      textValueArr,
    })
    let lotteryList = wx.getStorageSync('lotteryList') || []
    lotteryList = [
      ...lotteryList,
      ...confirmArr
    ]
    console.log(lotteryList, '---存储全局选号信息')
    //存储全局选号信息
    wx.setStorageSync('lotteryList', lotteryList);
    // 关闭确认选号弹框
    this.toggleDialog()
    // 跳转选号篮（暂不跳转）
    // wx.navigateTo({
    //   url: '/pages/pickNumBasket/index'
    // });
  },
  // 胆拖提示
  toggleDTDialog: function () {
    this.setData({
      showDTDialog: !this.data.showDTDialog
    });
  },
  // 跳转记录列表
  toRecordList: function () {
    wx.navigateTo({
      url: '/pages/record/index?lot_id=' + this.data.lot_id
    });
  },
  // 跳转选号篮
  toPickNumBasket: function () {
    wx.navigateTo({
      url: '/pages/pickNumBasket/index'
    });
  },
})
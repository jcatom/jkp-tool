//index.js
import api from '../../utils/api'
import util from '../../utils/util'
import {
  login
} from '../../utils/user'
import {
  $wuxDialog
} from '../../wux-weapp/dist/index'

const placeholder = '';
const lineBreak = '$'
const defaultText = [placeholder]

function normalizeTextData(textArr) {
  // 遍历所有文字，对其按换行符分组
  const output = [];
  let subGroup = [];
  for (let i = 0; i < textArr.length; i++) {
    if (textArr[i] === lineBreak) {
      output.push(subGroup);
      subGroup = [];
      continue;
    }
    subGroup.push({
      val: textArr[i],
      index: i
    });
  }
  output.push(subGroup);
  return output;
}

// TODO: 提交文本时,应过滤掉文本内所有placeholder
Page({
  data: {
    lot_id: '50',
    currentTab: 0, //当前tab
    // 默认文字，必须有一个占位符，不然无法正常使用键盘
    textValue: defaultText,
    textValueGroup: normalizeTextData(defaultText), //文字组
    cursorIndex: -1, //当前光标位置
    textScrollId: '',
    keyBoardVisible: false,
    pasteTipVisible: false,
    showDialog: false,
    showDTDialog: false,
    showLoginDialog:false,
    showDialogTextArr:[],
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
  handleTextGroupTap(e) {
    const source = e.target.dataset.source;
    // 当行被点击时需要设置行内最后一个字的光标
    this.setData({
      cursorIndex: source[source.length - 1].index,
      keyBoardVisible: true
    })
  },
  onTextTap(e) {
    // 隐藏粘贴提示
    this.setData({
      pasteTipVisible: false
    })
    const curTextIdx = e.target.dataset.index;
    this.setData({
      cursorIndex: curTextIdx,
      keyBoardVisible: true
    })
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
    this.setData({showLoginDialog:true})
  },
  // 隐藏登录引导弹框
  hideLoginDialog: function () {
    this.setData({showLoginDialog:false})
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
      })
      this._clearNumber()
    }
  },
  // 隐藏系统键盘
  hideOldKeyboard: function () {
    // 在input、textarea等focus拉起键盘之后，手动调用此接口收起键盘
    wx.hideKeyboard()
  },

  updateTextAndCursor(textValue, cursorIndex, callback) {
    this.setData({
      textValueGroup: normalizeTextData(textValue),
      textValue,
      cursorIndex
    }, callback || function () {})
  },

  // 长按显示粘贴提示
  showPasteTip: function (e) {
    this.setData({
      pasteTipVisible: true
    })
  },
  //调用剪贴板 实现粘贴
  pasteText: function () {
    const {
      textValue,
      cursorIndex
    } = this.data
    // 隐藏粘贴提示
    this.setData({
      pasteTipVisible: false
    })
    wx.getClipboardData({
      success: (res) => {
        const copyData = res.data
        const copyDataArr = copyData.split('');
        textValue.splice(~~cursorIndex, 0, ...copyDataArr);
        this.updateTextAndCursor(textValue, ~~cursorIndex + textValue.length)
      }
    })
  },
  //显示键盘
  showKeyboard: function () {
    // 拉起自定义键盘
    this.setData({
      cursorIndex: this.data.textValue.length - 1,
      keyBoardVisible: true,
    })
  },
  //关闭键盘
  closeKeyboard: function () {
    this.setData({
      cursorIndex: -1,
      keyBoardVisible: false,
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
    // 检查数字,从后往前遍历，直到遇到符号
    const textStr = textValue.filter(val => val !== placeholder).join('');
    const numArr = textStr.match(/[0-9]+/g)
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
  // 赋值按钮：输入框改变
  _inputNumber: function (e) {
    // 隐藏粘贴提示
    this.setData({
      pasteTipVisible: false
    })
    const curNum = e.currentTarget.dataset.number
    const {
      textValue,
      cursorIndex
    } = this.data;
    textValue.splice(cursorIndex, 0, curNum);
    this.updateTextAndCursor(textValue.slice(), cursorIndex + 1, () => {
      // 验证输入值是否正确
      this.validateInput()
      //textarea滚动到光标处
      this.setData({
        textScrollId: 'active-cursor'
      })
    })
  },
  // 功能按钮：换行
  _br: function () {
    // 一个有效换行符的构成应为一个占位符加一个真实换行符，占位符的作用为在换行后能点到上一行的末尾进行编辑
    const {
      textValue,
      cursorIndex
    } = this.data;
    textValue.splice(cursorIndex, 0, placeholder, lineBreak)
    this.updateTextAndCursor(textValue.slice(), cursorIndex + 2, () => {
      // 验证输入值是否正确
      this.validateInput()
      //textarea滚动到光标处
      this.setData({
        textScrollId: 'active-cursor'
      })
    })
  },
  // 功能按钮：清空
  _clearNumber: function () {
    const textValue = [placeholder]
    this.setData({
      textValue,
      textValueGroup: normalizeTextData(textValue),
      cursorIndex: 0,
      errorMsg: ''
    })
  },
  // 功能按钮：删除
  _delNumber: function (e) {
    const {
      textValue,
      cursorIndex
    } = this.data;
    // 应删除的字符索引
    const shouldDelIdx = cursorIndex - 1;
    if (shouldDelIdx > -1) {
      const newTextValue = [];
      // 删除的字符总数
      let deletedNum = 0;
      textValue.forEach((val, i) => {
        // 跳过对应序号的字符
        if (i === shouldDelIdx) {
          deletedNum++;
          return;
        }
        // 如果有连续的placeholder，则只保留一个
        if (newTextValue[newTextValue.length - 1] === placeholder && val === placeholder) {
          // 如果当前被抛弃的字符索引小于当前光标位置，则计入被删除字符总数，在光标位置之后的字符删除不影响新的光标位置
          if (i <= cursorIndex) {
            deletedNum++;
          }
          return;
        }
        newTextValue.push(val);
      })
      this.updateTextAndCursor(newTextValue, cursorIndex - deletedNum, () => {
        this.validateInput();
      })
    }
  },
  // 功能按钮：长按删除 
  _delLongpress: function (e) {
    const textValue = this.data.textValue.slice(0, -1)
    this.setData({
      textValue: textValue
    })
  },
  // 功能按钮：确定
  _confirmNumber: function () {
    this.closeKeyboard()
  },
  // 使用号码示例
  copyText: function (e) {
    let {
      textValue
    } = this.data
    const text = e.target.dataset.text
    const hasValidText = textValue.filter(val => val !== placeholder).length > 0;
    textValue = hasValidText ? textValue.concat(lineBreak, text.split(''), placeholder) : text.split('').concat(placeholder)
    this.updateTextAndCursor(textValue, textValue.length - 1, () => {
      this.setData({
        textScrollId: 'active-cursor'
      })
    });
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
  // 生成二维码确认弹框
  toggleDialog: function () {
    let showDialogText =''
    if( !this.data.showDialog){
      const {textValue} = this.data
      showDialogText = textValue.filter(val => val !== placeholder).join('');
    }
    console.log(showDialogText.split('$'),'-----showDialogText')
    this.setData({
      showDialog: !this.data.showDialog,
      showDialogTextArr:showDialogText.split('$')
    });
  },
  // 胆拖提示
  toggleDTDialog: function () {
    this.setData({
      showDTDialog: !this.data.showDTDialog
    });
  },
  createQrCode: function () {
    // 关闭确认弹框
    this.toggleDialog()
    const {textValue} = this.data
    const bet_number = textValue.filter(val => val !== placeholder).join('');
    const params = {
      lot_id: this.data.lot_id,
      bet_number
    }
    // 生成二维码（生成订单）
    api.createQrCode(params)
      .then(res => {
        const data = res.data || {}
        const params = {
          ...data,
          lot_code: data.lot_id,
          bet_project_id: data.project_id,
          bet_number,
          total_amount: data.total_amt,
          isFromIndex:true
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
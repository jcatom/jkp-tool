// 成功提示
var success = function (msg) {
  wx.showToast({
    title: msg || '成功',
    image: '/img/icon/success.png',
    duration: 2000
  })
}

// 失败提示
var error = function (msg) {
  wx.showToast({
    title: msg || '失败',
    image: '/img/icon/error.png',
    duration: 3000
  })
}

// 警告提示
var warning = function (msg) {
  wx.showToast({
    title: msg || '警告',
    image: '/img/icon/warning.png',
    duration: 3000
  })
}

/**
 * 判断JS变量是否空值
 * 如果是 undefined， null， ""， NaN，false，0，[]，{} ，含有空格的空白字符串，都返回true，否则返回false
 * @param v(变量v)
 * @returns {boolean}
 */
var isEmpty = function (v) {
  switch (typeof v) {
    case "undefined":
      return true;
    case "string":
      // 去掉空格、换行
      if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length === 0) {
        return true;
      }
      break;
    case "boolean":
      if (!v) {
        return true;
      }
      break;
    case "number":
      if (v === 0 || isNaN(v)) {
        return true;
      }
      break;
    case "object":
      if (v === null || v.length === 0) {
        return true;
      }
      for (const i in v) {
        return false;
      }
      return true;
  }
  return false;
}

// 毫秒 转 日月
var millisecondToYearMonth = function (time) {
  var date = new Date(parseInt(time, 10));
  //月份为0-11，所以+1，月份小于10时补个0
  var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;

  return date.getFullYear() + "." + month
}
// 日月(2019.06) 转 毫秒
var yearMonthToMillisecond = function (time) {
  // IOS系统只识别 " / " 不识别 " - " 且 IOS只支持转化 年/月/日
  time = time.replace(/\./g, '/')

  // 2019/06
  if (time.length <= 7) {
    time = time + "/01"
  }
  var millisecond = Date.parse(new Date(time))

  return millisecond
}
// 日期格式化
var formatTime = function (date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

var formatNumber = function (n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 去除字符串前后空格
var trim = function (str) {
  return `${str}`.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');
}

// 验证手机号
var checkPhone = function (value) {
  // 去除字符串前后空格
  value = trim(value)
  const exp = /^1[345789]\d{9}$/;
  return value && exp.test(value)
}
// 验证邮箱
var checkEmail = function (value) {
  // 去除字符串前后空格
  value = trim(value)
  const exp = /^\w+@\w+\.[a-z]+$/;
  return value && exp.test(value)
}
// 判断数字
var checkNumber = function (value) {
  const exp = /^[0-9]*$/;
  if (value == "0") {
    return exp.test(value)
  }
  return value && exp.test(value)
}
// 唯一id
var uuid = (len, radix) => {
  var uuid;
  var chars, i, r, uuid;
  chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  uuid = [];
  i = void 0;
  radix = radix || chars.length;
  if (len) {
    i = 0;
    while (i < len) {
      uuid[i] = chars[0 | Math.random() * radix];
      i++;
    }
  } else {
    r = void 0;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    i = 0;
    while (i < 36) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[i === 19 ? r & 0x3 | 0x8 : r];
      }
      i++;
    }
  }
  return uuid.join('');
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      // 检验当前用户的session_key是否有效
      wx.checkSession({
        success: function () {
          // console.log("当前处于登录状态");
          resolve(true);
        },
        fail: function () {
          // console.log("需要重新登录");
          reject(false);
        }
      })
    } else {
      reject(false);
    }
  });
}

// 处理后台返回的投注数据
var handleOneBetData = (row) => {
  const playName = {
    '50': '游戏一',
    '56': '游戏二',
    '51': '游戏三',
  }
  row.playName = playName[row.lot_code]
  // 以 $ 分隔一注
  let bet_number_arr = row.bet_number ? row.bet_number.split("$") : []


  // 不显示 @
  bet_number_arr = bet_number_arr.map(item => {
    const i = `${item}`.indexOf("@")
    if (i > -1) {
      item = item.slice(0, i)
    }
    return item
  })
  row.bet_number_arr = bet_number_arr
  row.bet_number = bet_number_arr.join("\n")
}
// 检查输入的数字是否规范
var checkNumber = (num, lot_Code, type = 'red') => {
  num = ~~num
  switch (lot_Code) {
    case '50': //游戏1
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
      break;
    case '56': //游戏2
      if (num >= 1 && num <= 30) {
        return true
      } else {
        return false
      }
      break;
    case '51': //游戏3
      if (num >= 0 && num <= 9) {
        return true
      } else {
        return false
      }
      break;
    default:
      return true
  }
}

//计算组合数公式 C5/6
function Cmn(m, n) {
  var n1 = 1,
    n2 = 1;
  for (var i = m, j = 1; j <= n; n1 *= i--, n2 *= j++);
  return n1 / n2;
}
/**
 * Ssq号码确认校验
 * 1、确认是否有red和blue
 * 2、确认是否有rdm,确认play_id
 * 3、验证rdm、red、blue数值范围
 * 4、验证rdm、red、blue球数
 * 5、验证rdm与red不能重复
 * return {
 *  lotCode: '50',
 *  play_id:50001/50002,
 *  id: uuid(),
 *  num,
 *  rdmArr,
 *  redArr,
 *  blueArr,
 *  zs: 1,
 *  isError:false,
 *  errMsg:'',
 * }
 * */
function checkSsq(ssqObj) {
  const numReg = /[,]/g
  // 1、确认是否有red和blue（前后区使用|或-隔开）
  const reg = /[|-]/g
  const separator = ssqObj.num.match(reg)
  if (!separator || separator.length !== 1) {
    ssqObj.isError = true
    ssqObj.errMsg = 'blue不存在'
    return ssqObj
  }
  const redAndBlue = ssqObj.num.split(reg)
  ssqObj.blueArr = redAndBlue[1].split(',')
  // 2、确认是否有rdm,确认play_id
  const rdmReg = /[#]/g
  const rdmSep = redAndBlue[0].match(rdmReg)
  if (rdmSep && rdmSep.length > 1) {
    ssqObj.isError = true
    ssqObj.errMsg = 'rmd与red分隔错误'
    return ssqObj
  } else if (rdmSep && rdmSep.length === 1) {
    // 有rdm
    ssqObj.play_id = '50002'
    const reds = redAndBlue[0].split(rdmReg)
    ssqObj.rdmArr = reds[0].split(numReg)
    ssqObj.redArr = reds[1].split(numReg)
  } else {
    // 无rdm
    ssqObj.play_id = '50001'
    ssqObj.redArr = redAndBlue[0].split(numReg)
    ssqObj.rdmArr = []
  }
  var rdmLen = ssqObj.rdmArr.length;
  var redLen = ssqObj.redArr.length;
  var blueLen = ssqObj.blueArr.length;
  // 3、验证rdm、red、blue数值范围
  for (var i = 0; i < rdmLen; i++) {
    if (!checkNumber(ssqObj.rdmArr[i])) {
      ssqObj.isError = true
      ssqObj.errMsg = 'rdm数值不正确'
      return ssqObj
    }
  }
  for (var i = 0; i < redLen; i++) {
    if (!checkNumber(ssqObj.redArr[i])) {
      ssqObj.isError = true
      ssqObj.errMsg = 'red数值不正确'
      return ssqObj
    }
  }
  for (var i = 0; i < blueLen; i++) {
    if (!checkNumber(ssqObj.blueArr[i])) {
      ssqObj.isError = true
      ssqObj.errMsg = 'blue数值不正确'
      return ssqObj
    }
  }

  // 4、验证rdm、red、blue球数
  if (ssqObj.play_id == '50001') { //普通
    if (redLen < 6) {
      ssqObj.isError = true
      ssqObj.errMsg = 'red数量不正确'
      return ssqObj
    }
    if (blueLen < 1) {
      ssqObj.isError = true
      ssqObj.errMsg = 'blue数量不正确'
      return ssqObj
    }
    if (redLen >= 6 && blueLen >= 1) {
      return calcSsqZs(ssqObj);
    }
  } else if (ssqObj.play_id == '50002') {
    if (rdmLen + redLen < 7) {
      ssqObj.isError = true
      ssqObj.errMsg = 'red和rdm数量不正确'
      return ssqObj
    }
    if (blueLen !== 1) {
      ssqObj.isError = true
      ssqObj.errMsg = 'blue数量不正确'
      return ssqObj
    }
    if (rdmLen + redLen >= 7 && blueLen == 1) {
      // 5、验证rdm与red不能重复
      for (var i = 0; i < rdmLen; i++) {
        const index = ssqObj.redArr.findIndex(red => red == ssqObj.rdmArr[i])
        if (index > -1) {
          ssqObj.isError = true
          ssqObj.errMsg = 'rdm与red重复'
          return ssqObj
        }
      }
      return calcSsqZs(ssqObj);
    }
  }
  return ssqObj
}
/**计算注数*/
var calcSsqZs = function (ssqObj) {
  var rdm = ssqObj.rdmArr.length;
  var red = ssqObj.redArr.length;
  var blue = ssqObj.blueArr.length;
  var zs = 0;
  if (ssqObj.play_id == '50001' && red >= 6 && blue >= 1 ||
    ssqObj.play_id == '50002' && rdm > 0 && red + rdm >= 7) {
    zs = Cmn(red, 6 - rdm) * Cmn(blue, 1);
  }
  ssqObj.zs = zs
  return ssqObj
}

/**
 * Qlc号码确认校验
 * 1、确认是否有rdm,确认play_id
 * 2、验证rdm、red数值范围(1-30)
 * 3、验证rdm、red球数
 * 4、验证rdm与red不能重复
 * return {
 *  lotCode: '56',
 *  play_id:56001/56002,
 *  id: uuid(),
 *  num,
 *  rdmArr,
 *  redArr,
 *  zs: 1,
 *  isError:false,
 *  errMsg:'',
 * }
 * */
function checkQlc(qlcObj) {
  const numReg = /[-,]/g
  // 1、确认是否有rdm,确认play_id
  const rdmReg = /[#]/g
  const rdmSep = qlcObj.num.match(rdmReg)
  if (rdmSep && rdmSep.length > 1) {
    qlcObj.isError = true
    qlcObj.errMsg = 'rmd与red分隔错误'
    return qlcObj
  } else if (rdmSep && rdmSep.length === 1) {
    // 有rdm
    qlcObj.play_id = '56002'
    const reds = qlcObj.num.split(rdmReg)
    qlcObj.rdmArr = reds[0].split(numReg)
    qlcObj.redArr = reds[1].split(numReg)
  } else {
    // 无rdm
    qlcObj.play_id = '56001'
    qlcObj.redArr = qlcObj.num.split(numReg)
    qlcObj.rdmArr = []
  }
  var rdmLen = qlcObj.rdmArr.length;
  var redLen = qlcObj.redArr.length;
  //  2、验证rdm、red数值范围(1-30)
  for (var i = 0; i < rdmLen; i++) {
    if (!checkNumber(qlcObj.rdmArr[i])) {
      qlcObj.isError = true
      qlcObj.errMsg = 'rdm数值不正确'
      return qlcObj
    }
  }
  for (var i = 0; i < redLen; i++) {
    if (!checkNumber(qlcObj.redArr[i])) {
      qlcObj.isError = true
      qlcObj.errMsg = 'red数值不正确'
      return qlcObj
    }
  }
  // 3、验证rdm、red球数
  if (qlcObj.play_id == '56001') { //普通
    if (redLen < 7) {
      qlcObj.isError = true
      qlcObj.errMsg = 'red数量不正确'
      return qlcObj
    }
    if (redLen >= 7) {
      return calcQlcZs(qlcObj);
    }
  } else if (qlcObj.play_id == '56002') {
    if (rdmLen + redLen < 8) {
      qlcObj.isError = true
      qlcObj.errMsg = 'red和rdm数量不正确'
      return qlcObj
    }
    if (rdmLen + redLen >= 8) {
      // 5、验证rdm与red不能重复
      for (var i = 0; i < rdmLen; i++) {
        const index = qlcObj.redArr.findIndex(red => red == qlcObj.rdmArr[i])
        if (index > -1) {
          qlcObj.isError = true
          qlcObj.errMsg = 'rdm与red重复'
          return qlcObj
        }
      }
      return calcQlcZs(qlcObj);
    }
  }
  return qlcObj
}
/**计算注数*/
var calcQlcZs = function (qlcObj) {
  var rdm = qlcObj.rdmArr.length;
  var red = qlcObj.redArr.length;
  var zs = 0;
  if (qlcObj.play_id == '56001' && red >= 7 ||
    qlcObj.play_id == '56002' && rdm >= 1 && red + rdm >= 8) {
    zs = Cmn(red, 7 - rdm);
  }
  qlcObj.zs = zs
  return qlcObj
}

/**
 * Fc3d号码确认校验
 * 1、确认是否有-|,确认play_id
 * 2、验证baiw、shiw、gew、red数值范围(0-9)
 * 3、验证baiw、shiw、gew、red球数
 * 4、验证baiw、shiw、gew、red数组内部不能重复
 * return {
 *  lotCode: '51',
 *  play_id:51001/51002,
 *  id: uuid(),
 *  num,
 *  baiwArr,
 *  shiwArr,
 *  gewArr,
 *  redArr,(组选)
 *  zs: 1,
 *  isError:false,
 *  errMsg:'',
 * }
 * */
function checkFc3d(fc3dObj) {
  const numReg = /[,]/g
  // 1、确认是否有-|,确认play_id
  const zhixuanReg = /[-\|]/g
  const zhixuanSep = fc3dObj.num.match(zhixuanReg)
  if (zhixuanSep && zhixuanSep.length !== 2) {
    fc3dObj.isError = true
    fc3dObj.errMsg = '直选分隔符数量错误'
    return fc3dObj
  } else if (zhixuanSep && zhixuanSep.length === 2) {
    // 直选
    fc3dObj.play_id = '51001'
    fc3dObj.desc = '（直选）'
    const reds = fc3dObj.num.split(zhixuanReg)
    fc3dObj.baiwArr = reds[0].split(numReg)
    fc3dObj.shiwArr = reds[1].split(numReg)
    fc3dObj.gewArr = reds[2].split(numReg)
    fc3dObj.redArr = []
  } else {
    // 组选
    fc3dObj.play_id = '51004'
    fc3dObj.desc = '（组选）'
    fc3dObj.redArr = fc3dObj.num.split(numReg)
    fc3dObj.baiwArr = []
    fc3dObj.shiwArr = []
    fc3dObj.gewArr = []
  }
  var baiw_len = fc3dObj.baiwArr.length;
  var shiw_len = fc3dObj.shiwArr.length;
  var gew_len = fc3dObj.gewArr.length;
  var red_len = fc3dObj.redArr.length;
  // 2、验证baiw、shiw、gew、red数值范围(0-9)
  for (var i = 0; i < baiw_len; i++) {
    if (!checkNumber(fc3dObj.baiwArr[i])) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '百位数值不正确'
      return fc3dObj
    }
  }
  for (var i = 0; i < shiw_len; i++) {
    if (!checkNumber(fc3dObj.shiwArr[i])) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '十位数值不正确'
      return fc3dObj
    }
  }
  for (var i = 0; i < gew_len; i++) {
    if (!checkNumber(fc3dObj.gewArr[i])) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '个位数值不正确'
      return fc3dObj
    }
  }
  for (var i = 0; i < red_len; i++) {
    if (!checkNumber(fc3dObj.redArr[i])) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '数值不正确'
      return fc3dObj
    }
  }
  // 3、验证baiw、shiw、gew球数
  if (fc3dObj.play_id == '51001') { //直选
    if (baiw_len < 1||baiw_len>10) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '百位数量不正确'
      return fc3dObj
    }else if (shiw_len < 1||shiw_len>10) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '十位数量不正确'
      return fc3dObj
    }else if (gew_len < 1||gew_len>10) {
      fc3dObj.isError = true
      fc3dObj.errMsg = '个位数量不正确'
      return fc3dObj
    }else{
      // 4、验证baiw、shiw、gew数组内部不能重复
      var baiwary = fc3dObj.baiwArr.slice().sort();
      var shiwary = fc3dObj.shiwArr.slice().sort();
      var gewary = fc3dObj.gewArr.slice().sort();
      for(var i = 0; i < baiwary.length - 1; i++) {
        if(baiwary[i] == baiwary[i + 1]) {
          fc3dObj.isError = true
          fc3dObj.errMsg = '百位数值重复'
          return fc3dObj
        }
      }
      for(var i = 0; i < shiwary.length - 1; i++) {
        if(shiwary[i] == shiwary[i + 1]) {
          fc3dObj.isError = true
          fc3dObj.errMsg = '十位数值重复'
          return fc3dObj
        }
      }
      for(var i = 0; i < gewary.length - 1; i++) {
        if(gewary[i] == gewary[i + 1]) {
          fc3dObj.isError = true
          fc3dObj.errMsg = '个位数值重复'
          return fc3dObj
        }
      }
      return calcFc3DZs(fc3dObj)
    }
  } else if (fc3dObj.play_id == '51004') {//组选
    // 3、验证red球数
    if (red_len < 1||red_len>10) {
      fc3dObj.isError = true
      fc3dObj.errMsg = 'red数量不正确'
      return fc3dObj
    }else{
      // 4、验证red数组内部不能重复
      var redary = fc3dObj.redArr.slice().sort();
      for(var i = 0; i < redary.length - 1; i++) {
        if(redary[i] == redary[i + 1]) {
          fc3dObj.isError = true
          fc3dObj.errMsg = 'red数值重复'
          return fc3dObj
        }
      }
      return calcFc3DZs(fc3dObj)
    }
  }
  return fc3dObj
}

function calcFc3DZs(fc3dObj) {
  var zs = 0;
  var baiw_len = fc3dObj.baiwArr.length;
  var shiw_len = fc3dObj.shiwArr.length;
  var gew_len = fc3dObj.gewArr.length;
  var red_len = fc3dObj.redArr.length;
  if (fc3dObj.play_id == 51001) {
    zs = baiw_len * shiw_len * gew_len;
  } else if (fc3dObj.play_id == 51004) {
    zs = Cmn(red_len, 3);
  }
  fc3dObj.zs = zs
  return fc3dObj
}

function getLotIdByTab(tab){
  var lotId=0
  if (tab == 0) {
    //游戏1 
    lotId = '50';
  } else if (tab == 1) {
    //游戏2
    lotId = '56';
  } else if (tab == 2) {
    //游戏3
    lotId = '51';
  } 
  return lotId
}

module.exports = {
  success: success,
  error: error,
  warning: warning,
  isEmpty: isEmpty,
  formatTime: formatTime,
  millisecondToYearMonth: millisecondToYearMonth,
  yearMonthToMillisecond: yearMonthToMillisecond,
  trim: trim,
  checkPhone: checkPhone,
  checkEmail: checkEmail,
  checkNumber: checkNumber,
  uuid: uuid,
  checkLogin: checkLogin,
  handleOneBetData: handleOneBetData,
  checkSsq: checkSsq,
  checkQlc: checkQlc,
  checkFc3d: checkFc3d,
  getLotIdByTab:getLotIdByTab
}
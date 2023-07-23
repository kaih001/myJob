import $ from 'jquery'


export const host = '//work.doumi.com'


//请求B端接口host
// export const hostB = 'http://vip.corp.doumi.com'
export const hostB = '//vip.doumi.com'

/**
 * 判断有无网络
 * @public
 * @param {function} online  offline  参数
 * @example
 *      util.isOnline(() => {
 *          //有网时的回调      
 *      }, () => {
 *          //无网时的回调
 *      })
 * @since 1.5.0
 * @by xumingshan
 */
export const isOnline = (online, offline) => {
    let img = new Image()
    img.src = 'https://cdn.doumistatic.com/43,65999b7d0a972f.png?' + Math.random() * 1000
    img.onload = function () {
        online()
    }
    img.onerror = function () {
        offline()
    }
}


const api = '/sea/api/1.0/client/v1'
/**
 * 接口请求
 * @method ajax
 * @public
 * @param {JSON} ajaxParam 参数
 * @example
 *      util.ajax({
 *          url: 'path',
 *          data: {},
 *          timeout: 0,
 *          success: function(data){},
 *          error: function(){},
 *          noNetwork: function(){}
 *      })
 * @since 3.0.0
 */
export let ajax = (ajaxParam) => {
    let headersJson = {
        "X-Doumi-Agent": "weixinqy"
    };
    let param = '?dmclient=pcweb&X-Doumi-Agent=weixinqy'
    if (window.navigator.onLine == true) {
        //Online
        $.ajax({
            url: `${host}${api}${ajaxParam.url}${param}`,
            xhrFields: {
                withCredentials: true
            },
            timeout: ajaxParam.timeout || 10000,
            headers: headersJson,
            data: ajaxParam.data || {},
            dataType: ajaxParam.dataType || 'json',
            type: ajaxParam.type || 'GET',
            success: (data) => {
                if (data.errno == 104) {
                    //location.href = 'https://vip.doumi.com/'
                }
                ajaxParam.success(data)
                if (data.errno != 0) {
                    console.log('errno != 0 时 调/common/collect/put')
                    console.log('问题接口：' + ajaxParam.url)
                    console.log('入参：' + JSON.stringify(ajaxParam.data))
                    console.log('出参：' + JSON.stringify(data))
                    $.ajax({
                        url: `${host}${api}/common/collect/put${param}`,
                        xhrFields: {
                            withCredentials: true
                        },
                        headers: headersJson,
                        data: {
                            link: `${host}${api}${ajaxParam.url}`,
                            param: JSON.stringify(ajaxParam.data),
                            result: JSON.stringify(data)
                        },
                        type: "POST",
                        success: (data) => {
                            // console.log(data)
                        }
                    })
                }
            },
            error: (xhr, status) => {
                if (status === 'timeout') {
                    // alert('网络连接失败，请检查网络')
                    ajaxParam.noNetwork()
                } else {
                    ajaxParam.error(xhr, status)
                }

                console.log('走error 调/common/collect/put')
                console.log('问题接口：' + ajaxParam.url)
                console.log('入参：' + JSON.stringify(ajaxParam.data))
                $.ajax({
                    url: `${host}${api}/common/collect/put${param}`,
                    xhrFields: {
                        withCredentials: true
                    },
                    headers: headersJson,
                    data: {
                        link: `${host}${api}${ajaxParam.url}`,
                        param: JSON.stringify(ajaxParam.data),
                        result: JSON.stringify({
                            xhr: xhr,
                            status: status
                        })
                    },
                    type: "POST",
                    success: (data) => {
                        // console.log(data)
                    }
                })
            }
        });
    } else {
        //Offline
        ajaxParam.noNetwork()
    }

}
export let ajax2 = (ajaxParam) => {
    let headersJson = {
        "X-Doumi-Agent": "weixinqy"
    };
    let param = '?dmclient=pcweb&X-Doumi-Agent=weixinqy'
    if (window.navigator.onLine == true) {
        //Online
        $.ajax({
            url: `${host}${api}${ajaxParam.url}${param}`,
            xhrFields: {
                withCredentials: true
            },
            timeout: ajaxParam.timeout || 10000,
            headers: headersJson,
            data: ajaxParam.data || {},
            dataType: ajaxParam.dataType || 'json',
            type: ajaxParam.type || 'GET',
            success: (data) => {
                if (data.errno == 104) {
                    location.href = 'https://vip.doumi.com/';
                    return;
                }
                ajaxParam.success(data)
            },
            error: (xhr, status) => {
                if (status === 'timeout') {
                    // alert('网络连接失败，请检查网络')
                    ajaxParam.noNetwork()
                } else {
                    ajaxParam.error(xhr, status)
                }

                console.log('走error 调/common/collect/put')
                console.log('问题接口：' + ajaxParam.url)
                console.log('入参：' + JSON.stringify(ajaxParam.data))
                $.ajax({
                    url: `${host}${api}/common/collect/put${param}`,
                    xhrFields: {
                        withCredentials: true
                    },
                    headers: headersJson,
                    data: {
                        link: `${host}${api}${ajaxParam.url}`,
                        param: JSON.stringify(ajaxParam.data),
                        result: JSON.stringify({
                            xhr: xhr,
                            status: status
                        })
                    },
                    type: "POST",
                    success: (data) => {
                        console.log(data)
                    }
                })
            }
        });
    } else {
        //Offline
        ajaxParam.noNetwork()
    }

}
/**
 * 接口请求
 * @method ajax
 * @public
 * @param {JSON} ajaxParam 参数
 * @example
 *      util.ajax({
 *          url: 'path',
 *          data: {},
 *          timeout: 0,
 *          success: function(data){},
 *          error: function(){},
 *          noNetwork: function(){}
 *      })
 * @since 3.0.0
 */
export let ajaxB = (ajaxParam) => {
    let headersJson = {
        "X-Doumi-Agent": "weixinqy"
    };
    let param = '?dmclient=pcweb&X-Doumi-Agent=weixinqy'
    if (window.navigator.onLine == true) {
        //Online
        $.ajax({
            url: `${hostB}${ajaxParam.url}${param}`,
            xhrFields: {
                withCredentials: true
            },
            timeout: ajaxParam.timeout || 10000,
            headers: headersJson,
            data: ajaxParam.data || {},
            dataType: ajaxParam.dataType || 'json',
            type: ajaxParam.type || 'GET',
            success: (data) => {
                if (data.code == 104) {
                    location.href = 'https://vip.doumi.com/'
                }
                ajaxParam.success(data)
                // if(data.code != 0){
                //     console.log('errno != 0 时 调/common/collect/put')
                //     console.log('问题接口：'+ajaxParam.url)
                //     console.log('入参：'+JSON.stringify(ajaxParam.data))
                //     console.log('出参：'+JSON.stringify(data))
                //     $.ajax({
                //         url:`${host}${api}/common/collect/put${param}`,
                //         xhrFields:{
                //             withCredentials:true
                //         },
                //         headers: headersJson,
                //         data:{
                //             link: `${host}${api}${ajaxParam.url}`,
                //             param: JSON.stringify(ajaxParam.data),
                //             result: JSON.stringify(data)
                //         },
                //         type: "POST",
                //         success: (data) => {
                //             // console.log(data)
                //         }
                //     })
                // }
            },
            error: (xhr, status) => {
                if (status === 'timeout') {
                    // alert('网络连接失败，请检查网络')
                    console.log('B端接口超时')
                    console.log('超时接口：' + ajaxParam.url)
                    console.log('入参：' + JSON.stringify(ajaxParam.data))
                    ajaxParam.noNetwork()
                } else {
                    ajaxParam.error(xhr, status)
                }

                // console.log('走error 调/common/collect/put')
                // console.log('问题接口：'+ajaxParam.url)
                // console.log('入参：'+JSON.stringify(ajaxParam.data))
                // $.ajax({
                //     url:`${host}${api}/common/collect/put${param}`,
                //     xhrFields:{
                //         withCredentials:true
                //     },
                //     headers: headersJson,
                //     data:{
                //         link: `${host}${api}${ajaxParam.url}`,
                //         param: JSON.stringify(ajaxParam.data),
                //         result: JSON.stringify({
                //             xhr: xhr,
                //             status: status
                //         })
                //     },
                //     type: "POST",
                //     success: (data) => {
                //         // console.log(data)
                //     }
                // })
            }
        });
    } else {
        //Offline
        console.log('B端接口超时')
        ajaxParam.noNetwork()
    }

}


/**
 * localStorage 带过期时间的封装
 * key: 关键字
 * value: 值
 * exp: 过期时间，秒
 */
export let setLocalStorage = (key, value, exp) => {
    //不传过期时间 或 exp==0  ----  永不过期
    let curTime = 0
    if (exp) {
        curTime = new Date().getTime() + exp * 1000
    }
    window.localStorage.setItem(key, JSON.stringify({ data: value, time: curTime }))
}
export let getLocalStorage = (key) => {
    let data = window.localStorage.getItem(key)
    if (data !== null) {
        let dataObj = JSON.parse(data);
        // console.log(dataObj);
        if (dataObj.time != 0 && new Date().getTime() > dataObj.time) {
            console.log('信息已过期');
            window.localStorage.removeItem(key)
            return null
        } else {
            // console.log('返回缓存数据');
            return dataObj.data
        }
    }
    return null
}
/**
 * sessionStorage 会话级缓存
 * key: 关键字
 * value: 值
 */
export let setSessionStorage = (key, value) => {
    window.sessionStorage.setItem(key, JSON.stringify({ data: value }))
}
export let getSessionStorage = (key) => {
    let data = window.sessionStorage.getItem(key)
    if (data !== null) {
        return JSON.parse(data).data
    }
    return null
}
/* 
*  时间格式化————针对新建项目中会有开始与结束时间
*  start_date：开始时间
*  end_date: 结束时间
*/
export let formatData = (start_date, end_date) => {
    var s_date = ''
    var e_date = ''
    var reg = /^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/;
    if (reg.test(start_date)) {
        s_date = start_date
    } else {
        var start_m = (start_date.getMonth() + 1) < 10 ? '0' + (start_date.getMonth() + 1) : (start_date.getMonth() + 1)
        var start_d = start_date.getDate() < 10 ? '0' + start_date.getDate() : start_date.getDate()
        s_date = start_date.getFullYear() + '-' + start_m + '-' + start_d
    }
    var end_m = (end_date.getMonth() + 1) < 10 ? '0' + (end_date.getMonth() + 1) : (end_date.getMonth() + 1)
    var end_d = end_date.getDate() < 10 ? '0' + end_date.getDate() : end_date.getDate()
    e_date = end_date.getFullYear() + '-' + end_m + '-' + end_d
    let format_time = {
        s: s_date,
        e: e_date
    }
    return format_time
}
export let formatData1 = (time) => {
    let format_time = ''
    var reg = /^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/;
    if (reg.test(time)) {
        format_time = time
    } else {
        var t_m = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)
        var t_d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
        format_time = time.getFullYear() + '-' + t_m + '-' + t_d
    }
    return format_time
}
export let formatData2 = (time) => {
    let format_time = ''
    var reg = /^[12]\d{3}[-]?(0[1-9])|1[012]$/;
    if (reg.test(time)) {
        format_time = time
    } else {
        var t_m = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)
        format_time = time.getFullYear() + '-' + t_m
    }
    return format_time
}
export let formatMs2Date = (ms) => {
    let date = new Date(ms * 1000);  // 参数需要毫秒数，所以这里将秒数乘于 1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes() + ':';
    let s = date.getSeconds();
    return Y + M + D + ' ' + h + m + s;
}
/**
 * 节流、防抖
 */
export let debounce = function (fn, delay = 3000, immediate = false) {
    let timer = null;
    let isImmediateInvoke = false;
    function _debounce (...args) {
        if (timer !== null) {
            clearTimeout(timer)
        }
        if (!isImmediateInvoke && immediate) {
            fn.apply(this, args);
            isImmediateInvoke = true;
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
            isImmediateInvoke = false;
        }, delay)
    }
    return _debounce
}
/**
*  新建项目中——开始时间-结束时间的计算总天数
*  sDate1和sDate2是yyyy-MM-dd格式
*/
export let DateDiff = (startDate, endDate) => {
    var startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
    var endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
    var iDays = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24) + 1;
    return iDays;  //返回相差天数
}



//日期格式初始化
export let getLocalTime = (unixtime, pattern) => {
    Date.prototype.format = function (pattern) {
        var pad = function (source, length) {
            var pre = "",
                negative = (source < 0),
                string = String(Math.abs(source));

            if (string.length < length) {
                pre = (new Array(length - string.length + 1)).join('0');
            }

            return (negative ? "-" : "") + pre + string;
        };

        if ('string' != typeof pattern) {
            return this.toString();
        }

        var replacer = function (patternPart, result) {
            pattern = pattern.replace(patternPart, result);
        }

        var year = this.getFullYear(),
            month = this.getMonth() + 1,
            date2 = this.getDate(),
            hours = this.getHours(),
            minutes = this.getMinutes(),
            seconds = this.getSeconds();

        replacer(/yyyy/g, pad(year, 4));
        replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
        replacer(/MM/g, pad(month, 2));
        replacer(/M/g, month);
        replacer(/dd/g, pad(date2, 2));
        replacer(/d/g, date2);

        replacer(/HH/g, pad(hours, 2));
        replacer(/H/g, hours);
        replacer(/hh/g, pad(hours % 12, 2));
        replacer(/h/g, hours % 12);
        replacer(/mm/g, pad(minutes, 2));
        replacer(/m/g, minutes);
        replacer(/ss/g, pad(seconds, 2));
        replacer(/s/g, seconds);

        return pattern;
    };
    var timestr = 0
    if (unixtime.getTime) {
        timestr = unixtime
    } else {
        timestr = new Date(parseInt(unixtime))
    }
    var datetime = timestr.format(pattern);
    return datetime;
}

/**
 * [时间字符串转时间戳]
 * @param  {[String]} dateString [时间字符串，可以有两种格式1：'2016/11/15' 2：'2016-11-15']
 * @return {[Number]} Stamp      [时间戳(毫秒数)]
 */
export let getStampFromDate = (dateString) => {
    dateString = dateString.replace(/-/g, '/')
    let d = new Date(dateString)
    let Stamp = d.getTime()
    return Stamp
}

/**
 * 页面到底，调用callback
 */
export let scrollPageEnd = (callback) => {
    $(document).ready(function () { //本人习惯这样写了
        $(window).scroll(function () {
            // $(window).scrollTop() // 这个方法是当前滚动条滚动的距离
            //$(window).height()获取当前窗体的高度
            //$(document).height()获取当前文档的高度
            var bot = 20; //bot是底部距离的高度
            //console.log("window.scrollTop="+$(window).scrollTop(), "document.height="+$(document).height(), "window.height="+$(window).height());
            if ((bot + $(window).scrollTop()) >= ($(document).height() - $(window).height())) {
                callback();
            }
        });
    });
}
/**
 * [时间戳转时间字符串]
 *
 * @return {[Number]} Stamp      [时间戳(毫秒数)]
 */
export let getStampFromDateStr = (date) => {
    let y = date.getFullYear()
    let m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
    let d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    let today = y + '-' + m + '-' + d
    return today
}

export let locationHref = (data) => {
    location.href = host + data;
}
export let windowOpen = (data) => {
    window.open(host + data)
}
/**
 * [给定时间所在周的第一天和最后一天]
 * @param  {[String]} dateString [时间字符串，可以有两种格式1：'2016/11/15' 2：'2016-11-15']
 * @return {[Array]} Stamp      [日期'2016-11-15'格式]
 */
export let getWeekLastFirst = (dateString) => {
    let timestamp = getStampFromDate(dateString),
        nowDay = (new Date(timestamp)).getDay(),
        FirstDay = new Date(timestamp - 86400000 * nowDay),
        LastDay = new Date(timestamp + 86400000 * (6 - nowDay)),
        FirstDate = formatData1(new Date(FirstDay)),
        LastDate = formatData1(new Date(LastDay));
    return [FirstDate, LastDate]
}
/**
 * [给定时间所在月的第一天和最后一天]
 * @param  {[String]} dateString [时间字符串，可以有两种格式1：'2016/11/15' 2：'2016-11-15']
 * @return {[Array]} Stamp      [日期'2016-11-15'格式]
 */
export let getMonthLaskFirst = (dateString) => {
    let timestamp = getStampFromDate(dateString),
        timeObj = new Date(timestamp);
    timeObj.setDate(1);
    let FirstDate = formatData1(timeObj);
    timeObj.setMonth(timeObj.getMonth() + 1)
    timeObj.setDate(0)
    let LastDate = formatData1(timeObj);
    return [FirstDate, LastDate]

}
export let getQueryString = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = ('?' + window.location.href.split('?')[1]).substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
export let KqMapImg = {
    attendImgN: "data:image/png;base64,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",
    attendImgU: "data:image/png;base64,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",
    attendImgY: "data:image/png;base64,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",
    taskImg: "data:image/png;base64,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"
}
// 格式化金额(https://juejin.cn/post/7028086399601475591)
export const formatAmount = (money, decimals = 2, symbol = "") => {
    //处理四舍五入的精度问题(https://juejin.cn/post/7028841955056418847)
    const formatToFixed = (money, decimals = 2) => {
        return (
            Math.round((parseFloat(money) + Number.EPSILON) * Math.pow(10, decimals)) /
            Math.pow(10, decimals)
        ).toFixed(decimals);
    }
    return formatToFixed(money, decimals).replace(/\B(?=(\d{3})+\b)/g, ",").replace(/^/, `${symbol}`)
}
export const accMul = (num1, num2) => {
    var m = 0, s1 = num1.toString(), s2 = num2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}



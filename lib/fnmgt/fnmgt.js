
const fs = require('fs');
const path = require('path');

const file = require('../../utils/file')

function not_fount_err(fncName) {
    return new Function(`console.error("can not fount function: ${fncName}")`)
}

/**
 * 
 * @param {String} fncName 函数片段名称
 * @param {'js' | 'wasm'} type 返回的文件类型
 * @returns {Function} yourFunction | errFunction
 */
function findFnc(fncName = "", type = "js") {
    let fn = file.hasFile(fncName, type) ? file.getFile(fncName, type) : not_fount_err(fncName)

    // return fn.bind(fn)
    return (() => {
        // 将函数转换为字符串
        let fncString = fn.toString();
        // 提取函数体
        let functionBody = fncString.slice(fncString.indexOf('{') + 1, fncString.lastIndexOf('}'));

        // 提取参数列表
        let paramString = fncString.slice(fncString.indexOf('(') + 1, fncString.indexOf(')'));
        let params = paramString.split(',').map(param => param.trim());

        // 使用 new Function 创建新函数
        return new Function(...params, functionBody).bind(fn)
    })()
}

findFnc.__getlist__ = file.getListFromDB

let findFncProxy = new Proxy(findFnc, {
    get(target, prop, receiver) {
        if (Object.hasOwnProperty.call(target, prop)) {
            return Reflect.get(target, prop, receiver)
        }
        return target.call(receiver, prop)
    },
    set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
    }
});

module.exports = findFncProxy
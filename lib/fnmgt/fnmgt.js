
const fs = require('fs');
const path = require('path');

function testfnc1(fncName = "testfnc1") {
    let res = `${fncName}:1 this is fnc msg`
    console.log(res)
    return res
}
function testfnc2(x = "x", y = "y") {
    let res = `${x},${y}:2 this is fnc msg`
    console.log(this)
    return res
}

function not_fount_err(fncName) {
    return new Function(`console.error("can not fount function: ${fncName}")`)
}

function hasFile(fncName, type) {
    const archiveDir = ""
    const sourceResponseDir = ""
    const wasmResponseDir = ""
    if (fncName === "testfnc1" || fncName === "testfnc2") return true

    switch (type) {
        case "js": {
            return fs.existsSync(path.join(sourceResponseDir, `${fncName}.js`));
            break;
        }
        case "wasm": {

            break;
        }
        default: break
    }

    return false

}

function getFile(fncName, type) {

    if (fncName === "testfnc1") return testfnc1
    if (fncName === "testfnc2") return testfnc2

}

/**
 * 
 * @param {String} fncName 函数片段名称
 * @param {'js' | 'wasm'} type 返回的文件类型
 * @returns {Function} yourFunction | errFunction
 */
function findFnc(fncName = "", type = "js") {
    let fn = hasFile(fncName, type) ? getFile(fncName, type) : not_fount_err(fncName)

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

findFnc.__getlist__ = function () {
    console.log("list")
    return { "filename": ["js", "wasm"] }
}

module.exports = findFncProxy
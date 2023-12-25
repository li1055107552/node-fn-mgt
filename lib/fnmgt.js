
const fs = require('fs');
const path = require('path');

function testfnc1(fncName = "testfnc1") {
    let res = `${fncName}:1 this is fnc msg`
    console.log(res)
    return res
}
function testfnc2(x = "x", y = "y") {
    let res = `${x},${y}:2 this is fnc msg`
    console.log(res)
    return res
}

function not_fount_err(fncName) {
    return new Function(`console.error("can not fount function: ${fncName}")`)
}

function hsaFile(fncName, type) {
    const archiveDir = ""
    const sourceResponseDir = ""
    const wasmResponseDir = ""
    if (fncName === "testfnc1" || fncName === "testfnc2") return true

    switch (type) {
        case "js": {
            fs.existsSync(path.join(sourceResponseDir, fncName))
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
 * @returns 返回文件 | null
 */
function findFnc(fncName = "", type = "js") {
    let fn = hsaFile(fncName, type) ? getFile(fncName) : not_fount_err(fncName)

    return (() => {
        // 将函数转换为字符串
        let fncString = fn.toString();
        // 提取函数体
        let functionBody = fncString.slice(fncString.indexOf('{') + 1, fncString.lastIndexOf('}'));

        // 提取参数列表
        let paramString = fncString.slice(fncString.indexOf('(') + 1, fncString.indexOf(')'));
        let params = paramString.split(',').map(param => param.trim());

        // 使用 new Function 创建新函数
        return new Function(...params, functionBody);
    })()
}

if (require.main === module) {
    console.log('Called directly from the command line.');
    cli_entry()
} else {
    console.log('Imported as a module.');
    module.exports = findFnc;
}

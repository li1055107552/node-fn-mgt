const fs = require('fs')
const path = require('path')

const globalData = {
    archiveDir: path.join("..", "archive")
}

/**
 * @description 检查路径是否存在，如果不存在，则创建它。
 * @param {string} dirPath - 需要检查或创建的路径。
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`创建目录：${dirPath}`);
    } else {

    }
}

/**
 * @description 初始化
 */
function init() {
    const defaultConfig = require(path.join(__dirname, "../", "archive", "default.config.js"))
    const customConfig = require(defaultConfig.customConfig)

    // TODO: 这一部分后续需要改为Object的递归处理
    for (const defkey in defaultConfig) {
        if (Object.hasOwnProperty.call(customConfig, defkey)) {
            const cusVal = customConfig[defkey];
            globalData[defkey] = cusVal == "" ? defaultConfig[defkey] : cusVal
        } else {
            globalData[defkey] = defaultConfig[defkey]
        }
    }

    for (const key in globalData) {
        if (Object.hasOwnProperty.call(globalData, key)) {
            const value = globalData[key];
            ensureDirectoryExists(value)
        }
    }

    console.log(globalData);

}

/**
 * 
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @param {"has"|"get"} [action] 执行动作
 * @returns {Boolean|File} 是否存在文件 | 返回该文件
 */
function searchFile(fncName, type = 'js', action = 'has'){

    const fileTypeDir = globalData[type == 'js' ? 'sourceResponseDir' : 'wasmResponseDir']
    const filePath = path.join(fileTypeDir, `${fncName}.${type}`)

    if (action == 'has') {
        return fs.existsSync(filePath)
    }
    else if (action == 'get') {
        return fs.readFileSync(filePath)
    }
    else {
        console.log(`type: ${type}, fncName: ${fncName}, fileTypeDir: ${fileTypeDir}, filePath: ${filePath}`);
        return null
    }
}

/**
 * @description 查找是否存在这个文件
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {Boolean} 
 */
function hasFile(fncName = "", type = "js") {
    return searchFile(fncName, type, 'has')
}

/**
 * 
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {File} 返回该文件
 */
function getFile(fncName, type = 'js'){
    return searchFile(fncName, type, 'get')
}

function saveFile(fncObject, type = 'js') {
    const parse = require('./cli/parse')
    
}

function list(){

}

init()
module.exports = {
    hasFile, getFile, saveFile
}

function test() {
    init()
}
// test()
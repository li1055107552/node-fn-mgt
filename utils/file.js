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
        
        if(path.extname(dirPath)){
            const dir = path.dirname(dirPath);
            ensureDirectoryExists(dir)

            fs.writeFileSync(dirPath, "")
            console.log(`创建文件：${dirPath}`);
        }
        else{
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`创建目录：${dirPath}`);
        }
    } else {
        console.log(`已存在：${dirPath}`);
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

    if(!fs.existsSync(globalData.archiveDB)){
        fs.appendFileSync(globalData.archiveDB, JSON.stringify({}))
    }

    for (const key in globalData) {
        if (Object.hasOwnProperty.call(globalData, key)) {
            const value = globalData[key];
            ensureDirectoryExists(value)
        }
    }

    globalData.archiveData = JSON.parse(fs.readFileSync(globalData.archiveDB))

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

/**
 * @description 保存文件
 * @param {Object} fncObject 函数对象
 * @param {String} fncObject.name 函数名称
 * @param {String} fncObject.body 函数体
 * @param {Array} fncObject.params 函数参数
 * @param {Object} [fncObject.doc] 函数文档
 * @param {String} fncObject.doc.desc 函数描述
 * @param {String} fncObject.doc.demo 函数实例
 * @param {String} fncObject.originPath 提交的文件的路径
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {Boolean} 是否保存成功
 */
function saveFile(fncObject, type = 'js') {
    // type == js
    // 将函数(体)写入 temp/name.js
    // 获取 temp/name.js 的 md5_js
    // 生成 wasm
    // 获取 temp/name.wasm 的 md5_wasm
    // 把 temp/name.js 保存到 archive/source/name-md5_js.js
    // 把 temp/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
    // 更新 globalData.archiveData[name].push({
    //      originPath: fncObject.originPath,
    //      commitTime: Date.now(),
    //      hash_js: md5_js,
    //      hash_wasm: md5_wasm,
    //      path_js: archive/source/name-md5_js.js,
    //      path_wasm: archive/wasm/name-md5_wasm.wasm,
    //      doc: fncObject.doc
    // })

    // type == wasm
    // 获取 path/name.wasm 的 md5_wasm
    // 把 path/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
    // 更新 globalData.archiveData[name].push({
    //      originPath: fncObject.originPath || path/name.wasm,
    //      commitTime: Date.now(),
    //      hash_js: "",
    //      hash_wasm: md5_wasm,
    //      path_js: "",
    //      path_wasm: path/name.wasm,
    //      doc: fncObject.doc
    // })
}

function list(){

}

init()
// module.exports = {
//     hasFile, getFile, saveFile
// }

function test() {
    init()
    const parse = require('../lib/cli/parse')
    let fns = parse('./source/chunk.js')
    console.log(fns)
    for (const key in fns) {
        if (Object.hasOwnProperty.call(fns, key)) {
            const fnObj = fns[key];
            saveFile({
                name: key,
                body: fnObj.body,
                // params: fnObj.params,
                // doc: fnObj.doc
            })
        }
    }
    
}
// test()
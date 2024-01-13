const fs = require('fs');
const path = require('path')
const minimist = require('minimist');
const parse = require('../cli/parse')
const file = require('../../utils/file')

function cli_entry(cwd = process.cwd(), args) {

    console.log('Hello from fnmgt!');

    console.log(process.argv);
    console.log("cwd: ", cwd);
    console.log(args);
    let arg = minimist(process.argv.slice(2), {
        string: ['_'],
        boolean: ["upload"]
    })
    console.log(arg);

    const command = process.argv[2];

    if (command === 'run') {
        console.log('Running fnmgt...');
    }
    else if (command === 'upload') {
        let pathParam = process.argv[3]
        let realPath = path.join(cwd, pathParam)
        console.log(realPath);
        let fns = parse(realPath)

        for (const key in fns) {
            if (Object.hasOwnProperty.call(fns, key)) {
                const fnObj = fns[key];
                file.saveFile({
                    name: key,
                    body: fnObj.body,
                    params: fnObj.params,
                    originPath: realPath
                }).then(res => {
                    console.log("res: ", res);
                })
            }
        }

    }
    else if (command === 'list') {
        let list = file.getListFromDB()
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            console.log(element)
        }
    }
    else if (command === 'compile') {
        compile()
    }
    else {
        console.log('Unknown command:', command);
    }

}

function recursiveFileList(dir, ignore = []) {
    const result = [];

    function walk(currentDir) {
        const files = fs.readdirSync(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            if (ignore.some(entry => filePath.includes(entry.replace("/"||"\\", path.sep)))) {
                // Ignore specified files or directories
                continue;
            }

            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursively walk into subdirectories
                walk(filePath);
            } else {
                // Add file path to the result array
                result.push(filePath);
            }
        }
    }

    walk(dir);
    return result;
}




function compile(cwd = process.cwd()) {
    let regex = /fnmgt(?:\.[a-zA-Z0-9_]+|\(["'][^'"]*['"](?:\s*,\s*['"][^'"]*['"])?\))/g;
    // 先递归检查所有文件的引入

    // Example usage:
    const folderPath = cwd      // '/path/to/your/folder';
    const ignoreList = [`node_modules/`, `.git/`, '.gitignore', '.package.json'];

    const files = recursiveFileList(folderPath, ignoreList);

    console.log(files);

    // 找到所有引入了fnmgt模块的文件

    // 检查 通过fnmgt调用了哪些方法

    // 把这些方法取出来，fns[]

    // 合到同一个文件中去(这里可以代码压缩)，并保存在当前项目中

    // 然后更改源文件引入fnmgt的路径以及调用方式
}

cli_entry()
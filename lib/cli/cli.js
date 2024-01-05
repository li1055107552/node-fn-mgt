const path = require('path')
const minimist = require('minimist');
const parse = require('../cli/parse')

// import { saveFile } from '../../utils/file'
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
    else {
        console.log('Unknown command:', command);
    }

}


function compile() {

}

cli_entry()
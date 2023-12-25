const minimist = require('minimist');

function cli_entry(cwd = process.cwd(), args) {

    console.log('Hello from fnmgt!');

    console.log(process.argv);
    console.log(cwd);
    console.log(args);
    let arg = minimist(process.argv.slice(2), {
        string: ['_'],
        boolean: ["upload"]
    })
    console.log(arg);

    const command = process.argv[2];

    if (command === 'run') {
        console.log('Running fnmgt...');
    } else {
        console.log('Unknown command:', command);
    }

}


function compile() {

}
// compile()

module.exports = cli_entry
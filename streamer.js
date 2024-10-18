const fs = require('fs');
const { argv } = require('process');

let self = {};
self.__data = "";
self.header = null;
self.readFile =  (filePath, chunkSize) => {
    const spec = {
        highWaterMark: chunkSize,
        encoding: "utf8",
    }
    const readableStream = fs.createReadStream(filePath, spec);

    readableStream.on('error', function (error) {
        console.log(`error: ${error.message}`);
    })

    let surplus = "";
    readableStream.on('data', (chunk) => {
        let data = surplus + chunk;
        let lines = data.split("\n");
        if(!self.header){
            self.header = lines.splice(0,1)[0];
        }
        surplus = lines.pop();
        console.log("\n\neandebug lines are:", lines);
    });

    readableStream.on('end', () => {
        console.log("we done!", self.header);
    })
}


console.log(argv);
self.readFile(argv[2], 100)
const fs = require('fs');
const { argv } = require('process');

let self = {};
self.initialized = false;
self.header = null;
self.outputDestiny = "./output";
self.onReadLine = null;
self.dataStream = {
    read: null,
    write: null
}
self.init = (spec) => {
    self.chunkSizeIn  = spec.chunkSizeIn;
    self.chunkSizeOut = spec.chunkSizeOut;
    self.inputFile    = spec.inputFile;
    self.outputFile   = spec.outputFile;
    self.onReadLine   = spec.onReadLine;

    if (typeof spec.inputFile !== "string"){
        throw("please provide input file path!")
    }

    if (typeof spec.outputFile !== "string"){
        throw("please provide out file path!")
    }

    if (typeof spec.onReadLine !== "function"){
        throw("please add callback for read line events!")
    }

    console.log("eandebug input args:", argv);
    self.initialized = true;
    self.handleData();
    return self;
}

self.handleData =  () => {
    if (!self.initialized){
        throw("initialize streamer 1st!");
    }

    const readArgs = {
        highWaterMark: self.chunkSizeIn,
        encoding: "utf8",
    }
    self.dataStream.read = fs.createReadStream(self.inputFile, readArgs);
    const readStream = self.dataStream.read;
    readStream.on('error', function (error) {
        console.log(`error: ${error.message}`);
    })

    let surplus = "";
    readStream.on('data', (chunk) => {
        let data = surplus + chunk;
        let lines = data.split("\n");
        if(!self.header){
            self.header = lines.splice(0,1)[0];
        }
        surplus = lines.pop();
        if (lines.length > 0){
            self.onReadLine(lines);
        }

    });

    readStream.on('end', () => {
        if (surplus.length > 0){
            self.onReadLine([surplus]);
        }
        console.log("we done!", self.header);
    })

    //handle file output
    // const writeArgs = {
    //     highWaterMark: self.chunkSizeOut,
    //     encoding: "utf8",
    // }
    // self.dataStream.write = fs.createWriteStream(self.outputFile, writeArgs);
    // const writeStream = self.dataStream.write;
}

self.writeFile = () => {
    const writeStream = fs.createWriteStream(filePath, {

    })
}


console.log(argv);
self.init({
    chunkSizeIn: 10,
    chunkSizeOut: 100,
    inputFile: argv[2],
    outputFile: argv[3] || "./output",
    onReadLine: (data) => {
        console.log("eandebug this is a readline event", data)
    }
})

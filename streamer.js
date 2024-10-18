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

    // intialize file output handler
    const writeArgs = {
        highWaterMark: self.chunkSizeOut,
        encoding: "utf8",
    }
    self.dataStream.write = fs.createWriteStream(self.outputFile, writeArgs);
    let surplus = "";
    readStream.on('data', (chunk) => {
        let data = surplus + chunk;
        let lines = data.split("\n");
        if(!self.header){
            self.header = lines.splice(0,1)[0];
        }
        surplus = lines.pop();
        if (lines.length > 0){
            let processedData = self.onReadLine(lines)
            self.write(processedData, false);
        }

    });

    readStream.on('end', () => {
        if (surplus.length > 0){
            let processedData = self.onReadLine([surplus])
            self.write(processedData, true);
        }
        console.log("we done!", self.header);
    })
}

self.write = (data, finished) => {
    const writeStream = self.dataStream.write;

    writeStream.on('error',  (error) => {
        console.log(`An error occured while writing to the file. Error: ${error.message}`);
    });

    writeStream.write(JSON.stringify(data) + "\n");

    if(finished){
        writeStream.end();
        console.log("PROGRAM COMPLETE");
        process.exit();
    }
}

module.exports = self.init;
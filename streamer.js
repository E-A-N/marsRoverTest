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

self.middleware = (data) => {
    let result = [];
    for (let i in data){
        let ugly = data[i];
        let dirty = ugly.split(")");
        let coordinates = dirty[0].split(",");
        //clean the left parethensis
        coordinates[0] = coordinates[0]
            .slice(1, coordinates[0].length);

        //clean extra space from cardinal data
        let startingCardinal = coordinates.pop()
        startingCardinal =startingCardinal
            .slice(1, dirty[1].length)

        coordinates = coordinates.map((axis) => {
            return Number(axis);
        })
        //clean space from instructions data
        let pathInstructions = dirty[1]
            .slice(1, dirty[1].length)
        result.push({
            position: coordinates,
            cardinal: startingCardinal,
            instructions: pathInstructions
        });
    }

    return result;
}

self.middlewareOut = (data) => {
    let result = [];
    for (let i in data){
        let dataPrep = data[i];
        let output = `(${dataPrep[0]}, ${dataPrep[1]}, ${dataPrep[2]})`
        if (dataPrep.length > 3){
            output += ` ${dataPrep[3]}`;
        }
        output += "\n";

        result.push(output);
    }

    return result;
}

self.headerMiddleWare = (data) => {
    return data.split(" ").map((axis) => {
        return Number(axis);
    })
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
        newline: "\n",
        flags: 'a'
    }
    self.dataStream.write = fs.createWriteStream(self.outputFile, writeArgs);
    let surplus = "";
    readStream.on('data', (chunk) => {
        let data = surplus + chunk;
        let lines = data.split("\n");
        if(!self.header){
            self.header = lines.splice(0,1)[0];
            let cleanedData = self.headerMiddleWare(self.header);
            self.header = cleanedData;
        }
        surplus = lines.pop();
        if (lines.length > 0){
            let cleanedData = self.middleware(lines);
            let processedData = self.onReadLine(cleanedData, self.header);
            self.write(processedData, false);
        }

    });

    readStream.on('end', () => {
        if (surplus.length > 0){
            let cleanedData = self.middleware([surplus]);
            let processedData = self.onReadLine(cleanedData, self.header);
            self.write(processedData);
        }
        console.log("we done!", self.header);
    })
}

self.write = (data) => {
    const writeStream = self.dataStream.write;

    writeStream.on('error',  (error) => {
        console.log(`An error occured while writing to the file. Error: ${error.message}`);
    });

    let cleanedData = self.middlewareOut(data);
    for (let i in cleanedData){
        writeStream.write(
            cleanedData[i].toString()
        )
    }
}

module.exports = self.init;
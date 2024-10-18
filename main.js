const streamer = require("./streamer");
const { argv } = require('process');

const inputFile = argv[2];
const outputFile = argv[3];

streamer({
    chunkSizeIn: 10,
    chunkSizeOut: 100,
    inputFile: inputFile,
    outputFile: outputFile || "./output",
    onReadLine: (data) => {
        console.log("eandebug this is a readline event", data);
        return data;
    }
})
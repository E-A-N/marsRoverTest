const Streamer = require("./streamer");
const Robot     = require('./roboAlg');
const { argv } = require('process');
const inputFile = argv[2];
const outputFile = argv[3];

Streamer({
    chunkSizeIn: 10,
    chunkSizeOut: 100,
    inputFile: inputFile,
    outputFile: outputFile || "./output",
    onReadLine: (data, planeData) => {
        let results = [];
        for (let i in data){
            let spec = data[i];
            let robo = Robot(
                spec.position,
                spec.cardinal,
                planeData
            )

            results.push(
                robo.followInstructions(spec.instructions)
            );
        }

        return results;
    }
})
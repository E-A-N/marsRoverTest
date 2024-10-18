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
        // console.log("eandebug this is a readline event", data);
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

        // let roro1 = Robot([2,2], "North", [3,3]);
        return results;
    }
})
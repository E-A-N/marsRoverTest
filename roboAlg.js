const CardinalVectors = {
    North: [0, 1],
    South: [0, -1],
    East:  [1, 0],
    West:  [-1, 0]
}

const DirectionList = [
    "North",
    "East",
    "South",
    "West"
]

const Vector2D = (...startCoords) => {
    let self = {};
    self.coords = startCoords || [0,0]; //[x, y]

    self.add = (vectorIn) => {
        self.coords = [
            self.coords[0] + vectorIn.coords[0],
            self.coords[1] + vectorIn.coords[1]
        ]

        return self;
    }

    return self;
}

const Robot = (position, startCardinal, plane2D) => {
    let self = {};
    self.position = Vector2D(...position);
    self.cardinal = startCardinal;
    self.directionIndex = DirectionList.indexOf(startCardinal);
    
    self.turn90 = (direction) => {
        let rotation = direction === "R" ? 1 : -1;
        self.directionIndex += rotation;

        if (self.directionIndex > DirectionList.length - 1){
            self.directionIndex = 0;
        }

        if (self.directionIndex < 0){
            self.directionIndex = DirectionList.length - 1;
        }

        self.cardinal = DirectionList[self.directionIndex];
        console.log(self.cardinal, self.directionIndex, DirectionList);
    }

    self.moveForward = () => {
        let directionVector = Vector2D(...CardinalVectors[self.cardinal])
        self.position.add(directionVector);

        console.log(self.position.coords);
    }

    self.instructionMap = {
        "F": self.moveForward,
        "L": self.turn90,
        "R": self.turn90
    }

    self.followInstructions = (instPacket) => {
        let isLost = false;
        for (let i in instPacket){
            let instruction = instPacket[i];
            self.instructionMap[instruction](instruction);

            let outOfBounds = self.position.coords[0] < 0
                || self.position.coords[0] > plane2D[0]
                || self.position.coords[1] < 0
                || self.position.coords[1] > plane2D[1];
            
            if (outOfBounds){
                isLost = true;
                break;
            }
        }

        let result =  [
            self.position.coords[0],
            self.position.coords[1],
            self.cardinal[0]
        ]

        if (isLost){
            result.push("LOST");
        }
        return result;
    }

    console.log("final:", self.followInstructions("FFLLRR"));
}


let roro1 = Robot([2,2], "North", [3,3]);

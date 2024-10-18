const CardinalVectors = {
    North: [0, 1],
    South: [0, -1],
    East:  [1, 0],
    West:  [-1, 0]
}

const CardinalAliases = {
    "N": "North",
    "E": "East",
    "S": "South",
    "W": "West"
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

    self.subtract = (vectorIn) => {
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
    self.lastOkPosition = Object.assign({} ,self.position);;
    self.cardinal = CardinalAliases[startCardinal];
    self.directionIndex = DirectionList.indexOf(self.cardinal);
    
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
    }

    self.moveForward = () => {
        let directionVector = Vector2D(...CardinalVectors[self.cardinal])
        self.position.add(directionVector);
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

            self.lastOkPosition = Object.assign({} ,self.position);
        }

        let result =  [
            self.lastOkPosition.coords[0],
            self.lastOkPosition.coords[1],
            self.cardinal[0]
        ]

        if (isLost){
            result.push("LOST");
        }
        return result;
    }

    return self;
}


module.exports = Robot;
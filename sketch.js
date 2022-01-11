let features;
let model;

const ANALOG_LIGHT = "#F4F4F4";
const ANALOG_DARK = "#141414";

const ANALOG_WHITE = "#FFFFFF";
const ANALOG_BLACK = "#000000";
const ANALOG_RED = "#E11717";
const ANALOG_BLUE = "#0134E8";
const ANALOG_YELLOW = "#FFD600";
const ANALOG_GREEN = "#17D617";
const ANALOG_ORANGE = "#FF7527";
const ANALOG_PURPLE = "#7905C0";


const NATURE_SPRING = "#B2CC90";
const NATURE_SUMMER = "#EBD49C";
const NATURE_AUTUMN = "#EDCBC2";
const NATURE_WINTER = "#B7CFD5";
const NATURE_DARK = "#000000";

const RGB_RED = "#FF0000";
const RGB_GREEN = "#00EC00";
const RGB_BLUE = "#0135F0";
const RGB_DARK = "#000000";

const GAME_BLACK = "#000000";
const GAME_WHITE = "#FFFFFF";
const PACMAN_LIGHT = "#F5F5F1";
const PACMAN_HERO = "#FFF000";
const PACMAN_BADGUYS = [ "#EC2A2A","#EA9DE6","#74D5E6" ];

const RUBIK_PALETTE = [ "#25DA25", "#EC2A2A", "#FFFFFF", "#0173EF", "#FF7527", "#FFD600" ];
const RUBIK_BLACK = "#000000";

const STYLE_GRAIN = "grain";
const STYLE_SHADOW = "shadow";

const STYLE_GRAIN_AMOUNT = 10;

function setup() {
    console.log("https://www.emprops.io/");
    pseudorandom.fxhash();
    features = calculateFeatures();

    // BLPMatrix size
    model = {
        blps: [],
        background: {},
        bits: []
    };

    // Matrix size
    model.mRows = parseInt(features["Matrix"].split("x")[0]);
    model.mCols = parseInt(features["Matrix"].split("x")[1]);

    // Matrix bit contents
    model.bits = new Array(model.mRows);
    for(let i = 0; i < model.mRows; i++) {
        model.bits[i] = pseudorandom.integers(model.mCols, 0, 1);
    }

    for(let i = 0; i < model.bits.length; i++) {
        function addBlp(row, end, length) {
            const blp = {
                start: end - length,
                end: end,
                row: row,
                length: length,
            };
            blp.edge = blp.start == 0 ||
                blp.row == 0          ||
                blp.end == model.mCols    ||
                blp.row == model.mRows - 1;
            model.blps.push(blp);
        }   
        let blpLength = 0;
        for(let j = 0; j < model.bits[i].length; j++) {
            if(!model.bits[i][j]) {
                // 0
                addBlp(i, j, blpLength);
                blpLength = 0;
            } else {
                // 1
                blpLength++;
            }
        }
        addBlp(i, model.bits[i].length, blpLength);
    }

    applyColor();

    // console.log(model);

    createCanvas(windowWidth, windowHeight);
    noLoop();
}

function draw() {
    background(model.background.color);

    if(features["Type"] == "Analog") {
        if(features["Mode"] == "Light") {
            addGrain(STYLE_GRAIN_AMOUNT);
        }
        if(features["Mode"] == "Dark") {
            addGrain(STYLE_GRAIN_AMOUNT * 2);
        }
    }
    for(let i = 0; i < model.blps.length; i++) {
        drawBlp(model.blps[i]);
    }
    if(features["Type"] == "RGB") {
        if(features["Mode"] == "Light") {
            addScanLines(50, 2, 2);
        }
        if(features["Mode"] == "Dark") {
            addScanLines(100, 2, 2);
        }
    }

    fxpreview();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function applyColor() {
    let colorsToApply;
    switch(features["Type"]) {
        case "Life":
            const natureColors = {
                "Spring": NATURE_SPRING,
                "Summer": NATURE_SUMMER,
                "Autumn": NATURE_AUTUMN,
                "Winter": NATURE_WINTER,
            }
            if(features["Mode"] == "Light") {
                model.background.color = natureColors[features["Color"]];
                colorBlps(NATURE_DARK);
            }
            if(features["Mode"] == "Dark") {
                model.background.color = NATURE_DARK;
                colorBlps(natureColors[features["Color"]]);
            }
            break;
        case "RGB":
            let mainColor;
            const rgbColors = {
                "Red":   RGB_RED,
                "Green": RGB_GREEN,
                "Blue":  RGB_BLUE,
            }
            colorsToApply = [RGB_RED, RGB_BLUE, RGB_GREEN];
            if(features["Mode"] == "Light") {
                model.background.color = rgbColors[features["Color"]];
                mainColor = rgbColors[features["Color"]];
                colorBlps(RGB_DARK);
                // Removes the background color from the list so the blp doesn't disappear
                colorsToApply = colorsToApply.filter(c => c != mainColor);
            }
            if(features["Mode"] == "Dark") {    
                model.background.color = RGB_DARK;           
                mainColor = rgbColors[features["Color"]];
                colorBlps(mainColor);
            }
            colorRandomBlps(model.blps, colorsToApply);
            break;
        case "Analog":
            if(features["Mode"] == "Light") {
                model.background.color = ANALOG_LIGHT;
                colorBlps(ANALOG_BLACK);
            }
            if(features["Mode"] == "Dark") {
                model.background.color = ANALOG_DARK;   
                colorBlps(ANALOG_WHITE);
            }
            if(features["Color"] === "Primary") {
                colorsToApply = [ANALOG_RED, ANALOG_BLUE, ANALOG_YELLOW].sort(() => (pseudorandom.boolean() ? 1 : -1));
                colorRandomBlps(model.blps, colorsToApply, STYLE_SHADOW);
            }
            if(features["Color"] === "Secondary") {
                colorsToApply = [ANALOG_GREEN, ANALOG_PURPLE, ANALOG_ORANGE].sort(() => (pseudorandom.boolean() ? 1 : -1));
                colorRandomBlps(model.blps, colorsToApply, STYLE_SHADOW);
                let leftovers = model.blps.filter(e => (e.color == ANALOG_WHITE || e.color == ANALOG_BLACK));
                const primariesToInclude = pseudorandom.integer(0, 3);
                if(primariesToInclude > 0) {
                    colorsToApply = [ANALOG_RED, ANALOG_BLUE, ANALOG_YELLOW].sort(() => (pseudorandom.boolean() ? 1 : -1)).slice(0, primariesToInclude);
                    //console.log(colorsToApply, primariesToInclude, colorsToApply.slice(0, primariesToInclude));
                    colorRandomBlps(leftovers, colorsToApply, STYLE_SHADOW);
                }
            }
            break;
        case "Game":
            if(features["Color"] == "Pac-man") {
                if(features["Mode"] == "Light") {
                    model.background.color = PACMAN_LIGHT;
                    colorBlps(GAME_BLACK);
                }
                if(features["Mode"] == "Dark") {
                    model.background.color = GAME_BLACK;
                    colorBlps(GAME_WHITE);
                }
                let singles = model.blps.filter(e => e.length == 0);
                if(singles.length > 0) {
                    const hero = pseudorandom.integer(0, singles.length - 1);
                    singles[hero].color = PACMAN_HERO;
                } // Otherwise no pacman
                const badGuysColors = PACMAN_BADGUYS.sort(() => (pseudorandom.boolean() ? 1 : -1));
                let ghosts = model.blps.filter(e => e.length > 0);
                colorRandomBlps(ghosts, badGuysColors);
            }
            if(features["Color"] == "Rubik") {
                colorRubik();
            }
            break;
    }
}

function colorBlps(color) {
    model.blps = model.blps.map(blp => {
        blp.color = color;
        return blp;
    });
}

function colorRandomBlps(blps, colorsToApply, style) {
    const coloredBlps = pseudorandom.selectIntegersFromRange(colorsToApply.length,
        0, blps.length - 1);
    for(let i = 0; i < coloredBlps.length; i++) {
        blps[coloredBlps[i]].color = colorsToApply[i];
        if(style) {
            blps[coloredBlps[i]].style = style;
        }
    }
}

function colorRubik() {
    model.rubikPattern = RUBIK_PALETTE.sort(() => (pseudorandom.boolean() ? 1 : -1));
    if(features["Mode"] == "Light") {
        model.background.color = model.rubikPattern[0];
        colorBlps(GAME_BLACK);
        colorRandomBlps(model.blps, model.rubikPattern.slice(1, 6));
    }
    if(features["Mode"] == "Dark") {
        model.background.color = GAME_BLACK;
        colorBlps(model.rubikPattern[0]);
        colorRandomBlps(model.blps, model.rubikPattern);
    }
}

function drawBlp(blp) {
    const graphix = createGraphics(width, height);

    const sizes = {
        "S": 0.4,
        "M": 0.6,
        "L": 0.83,
    };
    const basicSize = sizes[features["Size"]];
    const squareSize = basicSize / model.mRows;
    const circleSize = squareSize * 0.95;
    const margin = 1 - basicSize;

    if(blp.style === STYLE_SHADOW) {
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 5;
        drawingContext.shadowBlur = 7;
        if(features["Mode"] === "Light") {
            drawingContext.shadowColor = "rgba(0, 0, 0, 0.75)";
        }
        if(features["Mode"] === "Dark") {
            drawingContext.shadowColor = "#000000";
        }
    }

    let startx, starty, endx, endy, r, w, h;

    
    if(features["Mode"] === "Light") {
        startx = dimensionlessx((margin / 2) + squareSize * (blp.start + 0.5));
        starty = dimensionlessy((margin / 2) + squareSize * (blp.row + 0.5));
        endx = dimensionlessx((margin / 2) + squareSize * (blp.end + 0.5));
        endy = dimensionlessy((margin / 2) + squareSize * (blp.row + 0.5));
        r = dimensionless(circleSize);
        rectx = startx;
        recty = dimensionlessy((margin / 2) + (squareSize * blp.row) + ((squareSize - circleSize) / 2));
        w = dimensionless(blp.length * squareSize);
        h = r;
    }
    if(features["Mode"] === "Dark") {
        startx = dimensionlessx((margin / 2) + squareSize * (blp.row + 0.5));
        starty = dimensionlessy((margin / 2) + squareSize * (blp.start + 0.5));
        endx = dimensionlessx((margin / 2) + squareSize * (blp.row + 0.5));
        endy = dimensionlessy((margin / 2) + squareSize * (blp.end + 0.5));
        r = dimensionless(circleSize);
        rectx = dimensionlessx((margin / 2) + (squareSize * blp.row) + ((squareSize - circleSize) / 2));
        recty = starty;
        w = r;
        h = dimensionless(blp.length * squareSize);

    }

    graphix.noStroke();
    graphix.fill(blp.color || 128);
    graphix.circle(startx, starty, r);
    graphix.circle(endx, endy, r);
    graphix.rect(rectx, recty, w, h);
    image(graphix, 0, 0);

    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = "rgba(0, 0, 0, 0)";
}

function addGrain(n){
    loadPixels();
    for(let e = 0; e < width * pixelDensity() * (height * pixelDensity()) * 4; e += 4) {
        let i = map(pseudorandom.decimal(), 0, 1, -n, n);
        pixels[e]     = pixels[e] + i,
        pixels[e + 1] = pixels[e + 1] + i,
        pixels[e + 2] = pixels[e + 2] + i,
        pixels[e + 3] = pixels[e + 3] + i;
    }
    updatePixels();
}

function addScanLines(n, thickness = 1, separation = 1){
    loadPixels();
    for(let e = 0; e < width * pixelDensity() * (height * pixelDensity()) * 4; e += 4) {
        if(Math.floor((e / (4 * thickness)) / (width * pixelDensity())) % separation == 0) {
            pixels[e]     = pixels[e] - n,
            pixels[e + 1] = pixels[e + 1] - n,
            pixels[e + 2] = pixels[e + 2] - n;
        }
    }
    updatePixels();
}

function mouseClicked() {
    if(features["Color"] == "Rubik") {
        colorRubik();
        redraw();
    }
}


// Saves the artwork as an image when the S key is pressed
function keyPressed() {
if (key == 's' || key == 'S') saveCanvas('basic', 'png');
}
  
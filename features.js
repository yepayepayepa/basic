function calculateFeatures() {
    const matrixCols = pseudorandom.integer(1, 4);
    const matrixRows = matrixCols + 1;
    const type = pseudorandom.pick(["Analog", "Life", "RGB", "Game"]);
    const mode = pseudorandom.weightedPick(["Light", "Dark"], [55, 45]);
    const size = pseudorandom.pick(["S", "M", "L"]);

    let color;
    if(type == "Life") {
        color = pseudorandom.pick(["Spring", "Summer", "Autumn", "Winter"]);
    }
    if(type == "RGB") {
        color = pseudorandom.pick(["Red", "Green", "Blue"]);
    }
    if(type == "Analog") {
        color = pseudorandom.weightedPick(["Primary", "Secondary"], [2, 1]);
    }
    if(type == "Game") {
        color = pseudorandom.pick(["Pac-man", "Rubik"]);
    }

    const features = {
        "Matrix": matrixRows + "x" + matrixCols,
        "Size": size,
        "Type": type,
        "Color": color,
        "Mode": mode,
    }

    // console.log(JSON.stringify(features, null, 4));

    // Sends the features to fxhash for processing
    window.$fxhashFeatures = features;
    return features;
}
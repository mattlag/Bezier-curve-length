let cache = {
    lineLengths: {},
    thresholdLengths: {},
    splitLengths: {}
};

// ---------------------------------
// Calculation functions
// ---------------------------------

const calculationFunctions = [
    {
        name: 'Threshold_1_Length',
        fn: function(seg){
            return calculateThresholdLength(seg, 1, true);
        }
    },
    {
        name: 'Threshold_10_Length',
        fn: function(seg){
            return calculateThresholdLength(seg, 10, true);
        }
    },
    {
        name: 'Threshold_100_Length',
        fn: function(seg){
            return calculateThresholdLength(seg, 100, true);
        }
    },
    {
        name: 'Split_10_Length',
        fn: function(seg){
            return calculateSplitLength(seg, 10);
        }
    },
    {
        name: 'Split_100_Length',
        fn: function(seg){
            return calculateSplitLength(seg, 100);
        }
    },
    {
        name: 'Split_1000_Length',
        fn: function(seg){
            return calculateSplitLength(seg, 1000);
        }
    },
    {
        name: 'Handle_Lengths',
        fn: function(seg){
            let h1 = calculateLineLength(
                {x: seg.p1x, y: seg.p1y},
                {x: seg.p2x, y: seg.p2y}
            );
            let h2 = calculateLineLength(
                {x: seg.p3x, y: seg.p3y},
                {x: seg.p4x, y: seg.p4y}
            );

            let re = h1+h2;

            // if(re === 0) console.log(`Handle_Lengths ${segmentID(seg)}`);

            return re;
        }
    },
    {
        name: 'Quadrangle_Length',
        fn: function(seg){
            let h1 = calculateLineLength(
                {x: seg.p1x, y: seg.p1y},
                {x: seg.p2x, y: seg.p2y}
            );
            let h2 = calculateLineLength(
                {x: seg.p2x, y: seg.p2y},
                {x: seg.p3x, y: seg.p3y}
            );
            let h3 = calculateLineLength(
                {x: seg.p3x, y: seg.p3y},
                {x: seg.p4x, y: seg.p4y}
            );

            let re = h1+h2+h3;

            // if(re === 0) console.log(`Three_Side_Length ${segmentID(seg)}`);

            return re;
        }
    },
    {
        name: 'Handle_Area',
        fn: function(seg) {
            let t1 = calculateTriangleArea({x: 1000, y: 1000}, {x: seg.p2x, y: seg.p2y});
            let t2 = calculateTriangleArea({x: 2000, y: 1000}, {x: seg.p3x, y: seg.p3y});

            return t1+t2;
        }
    },
    {
        name: 'Quadrangle_Area',
        fn: function(seg) {
            let t1 = calculateTriangleArea({x: 1000, y: 1000}, {x: seg.p2x, y: seg.p2y});
            let t2 = calculateTriangleArea({x: 2000, y: 1000}, {x: seg.p3x, y: seg.p3y});
            let w = seg.p3x - seg.p2x;
            let h = seg.p3y - seg.p2y;
            let q3 = Math.abs(w*h);

            return t1+t2+q3;
        }
    }
];

let testNames = ['Segment'];
for(let t=0; t<calculationFunctions.length; t++) testNames.push(calculationFunctions[t].name);

// ---------------------------------
// Main
// ---------------------------------

/**
 * This is a quarter circle with
 * Radius = 707.1
 * Segment length = 1110.71
 */
const quarterCircleSegment = {
    'p1x': 1000,
    'p1y': 1000,
    'p2x': 1276,
    'p2y': 1276,
    'p3x': 1724,
    'p3y': 1276,
    'p4x': 2000,
    'p4y': 1000,
};

let results = {};

function runCalculations() {
    let step = document.getElementById('handleStep').value * 1;
    let segmentsToTest = [quarterCircleSegment];
    let currentTestingSegment = 0;

    for(let p2x=0; p2x<=2000; p2x+=step){
    for(let p2y=1000; p2y<=2000; p2y+=step){
    for(let p3x=1000; p3x<=3000; p3x+=step){
    for(let p3y=1000; p3y<=2000; p3y+=step){
        segmentsToTest.push({
            'p1x': 1000,
            'p1y': 1000,
            'p2x': p2x,
            'p2y': p2y,
            'p3x': p3x,
            'p3y': p3y,
            'p4x': 2000,
            'p4y': 1000,
        });
    }}}}

    // console.log(`Added ${segmentsToTest.length} segments to test`);

    function runOneSegment() {
        
        if(currentTestingSegment >= segmentsToTest.length){
            finishOutput();
            return;
        }
        
        let seg = segmentsToTest[currentTestingSegment];
        let segID = segmentID(seg);

        // console.log(`Running segment ${currentTestingSegment}\t${segID}`);

        let re = {};
        let test;

        if (!results[segID] && !results[segmentID(getMirror(seg))]){  
            for (let t=0; t<calculationFunctions.length; t++) {
                test = calculationFunctions[t];
                re[test.name] = test.fn(seg);
                // console.log(`\t${test.name}: ${re[test.name]}`);
            }
            results[segID] = re;
        } else {
            // console.log('\tDUPLICATE');
        }

        currentTestingSegment++;

        updateProgressBar(currentTestingSegment / segmentsToTest.length);

        window.setTimeout(runOneSegment, 10);
    }


    function finishOutput(){
        // console.log('finishOutput - start');
        
        let sortedResults = [];
        let item;

        for(let segID in results) {
            if(results.hasOwnProperty(segID)) {
                item = results[segID];
                item['Segment'] = segID;
                sortedResults.push(item);
            }
        }

        sortedResults.sort(function(a, b) {
            return a['Threshold_1_Length'] - b['Threshold_1_Length'];
        });

        let table = '<table><tr>';
        
        for (let t=0; t<testNames.length; t++) {
            table += `<td><b>${testNames[t]}</b></td>`;
        }
        
        table += '</tr>';
        
        let oneResult;

        for(let r=0; r<sortedResults.length; r++) {
            table += `<tr>`;
            oneResult = sortedResults[r];
            
            for (let n=0; n<testNames.length; n++) {
                if(testNames[n] === 'Segment'){
                    table += `<td class="namecol">${oneResult['Segment']}</td>`;
                } else {
                    table += `<td title="${testNames[n]}\n${oneResult[testNames[n]]}">${round(oneResult[testNames[n]], 6)}</td>`;
                }
            }
            
            table += '</tr>';
        }
        
        table += '</table>';
        
        document.getElementById('results').innerHTML = table;

        // console.log('finishOutput - end');
    }

    // Run calculations
    // runOneSegment(quarterCircleSegment);
    runOneSegment();
}



// ---------------------------------
// Helpers
// ---------------------------------

/**
 * Creates a string ID based on two points
 * @param {object} p1 - x/y coordinate of p1
 * @param {object} p2 - x/y coordinate of p2
 * @returns {string}
 */
function lineID(p1, p2) {
    return `${p1.x}_${p1.y}_${p2.x}_${p2.y}`;
}

/**
 * Creates a string ID based on segment points
 * Assumes that P1 and P4 are always the same
 * @param {object} seg - segment object
 * @returns {string}
 */
function segmentID(seg) {
    // return `${seg.p1x},${seg.p1y}|${seg.p2x},${seg.p2y}|${seg.p3x},${seg.p3y}|${seg.p4x},${seg.p4y}`;
    return `${seg.p2x},${seg.p2y}__${seg.p3x},${seg.p3y}`;
}

/**
 * Animates the fancy progress bar
 */
function updateProgressBar(percent) {
    // console.log(`\tProgress bar at ${percent}`);

    let width = document.getElementById('progressBarWrapper').offsetWidth;
    let bar = document.getElementById('progressBar');
    bar.style.width = `${Math.round(width*percent)}px`;
    bar.style.opacity = 0.2 + (0.8 * percent);
};

/**
 * Better rounding than Math.round
 * @param {number} num - number to round
 * @param {number} dec - number of decimal places
 * @returns {number}
 */
function round(num, dec = 0) {
    if (!num) return 0;
    return Number(Math.round(num+'e'+dec)+'e-'+dec) || 0;
}

// ---------------------------------
// Bezier functions
// ---------------------------------

/**
 * Splits a segment based on a decimal value ("time" is a metaphor here, from 0 to 1 second)
 * @param {object} seg - Bezier segment object
 * @param {number} t - decimal from 0 to 1 representing how far along the curve to split
 * @returns {array} - Array with two segments resulting from the split
 */
function splitAtTime(seg, t = 0.5) {
    let rs = (1 - t);

    // Do some math
    let x12 = (seg.p1x * rs) + (seg.p2x * t);
    let y12 = (seg.p1y * rs) + (seg.p2y * t);
    let x23 = (seg.p2x * rs) + (seg.p3x * t);
    let y23 = (seg.p2y * rs) + (seg.p3y * t);
    let x34 = (seg.p3x * rs) + (seg.p4x * t);
    let y34 = (seg.p3y * rs) + (seg.p4y * t);
    let x123 = (x12 * rs) + (x23 * t);
    let y123 = (y12 * rs) + (y23 * t);
    let x234 = (x23 * rs) + (x34 * t);
    let y234 = (y23 * rs) + (y34 * t);
    let x1234 = (x123 * rs) + (x234 * t);
    let y1234 = (y123 * rs) + (y234 * t);

    // Return two new Segments
    return [
        {
            'p1x': seg.p1x,
            'p1y': seg.p1y,
            'p2x': x12,
            'p2y': y12,
            'p3x': x123,
            'p3y': y123,
            'p4x': x1234,
            'p4y': y1234,
        },
        {
            'p1x': x1234,
            'p1y': y1234,
            'p2x': x234,
            'p2y': y234,
            'p3x': x34,
            'p3y': y34,
            'p4x': seg.p4x,
            'p4y': seg.p4y,
        },
    ];
}

/**
 * Calculates the distance between two points
 * @param {object} p1 - x/y coordinate of p1
 * @param {object} p2 - x/y coordinate of p2
 * @returns {number}
 */
function calculateLineLength(p1, p2) {
    // Returned a cached result if exists
    // if(cache.lineLengths[lineID(p1, p2)] || cache.lineLengths[lineID(p2, p1)]){
    //     return cache.lineLengths[lineID(p1, p2)];
    // }

    // Otherwise, calculate it
    let adj = p2.x - p1.x;
    let opp = p2.y - p1.y;
    let result = Math.sqrt( (adj*adj) + (opp*opp) );

    // if(result === 0){
    //     console.log(`Line Length = 0`);
    //     console.log(`p1: ${p1.x} / ${p1.y}`);
    //     console.log(`p2: ${p2.x} / ${p2.y}`);
    //     console.log(`adj: ${adj}`);
    //     console.log(`opp: ${opp}`);
    // }
    // cache.lineLengths[lineID(p1, p2)] = result;

    return result;
}

/**
 * Find the length of a curve, recursively
 * At small enough sizes, straight lines approximate a curve
 * @param {object} seg - Bezier segment object
 * @returns {number}
 */
function calculateThresholdLength(seg, threshold = 10, topLevel = false) {
    // Returned a cached result if exists
    // if(cache.thresholdLengths[segmentID(seg)] || cache.thresholdLengths[segmentID(getMirror(seg))]){
    //     return cache.thresholdLengths[segmentID(seg)];
    // }

    let re;
    let length = calculateLineLength(
        {x: seg.p1x, y: seg.p1y},
        {x: seg.p4x, y: seg.p4y}
    );

    if (length < threshold) {
        re = length;
    } else {
        let s = splitAtTime(seg);
        re = calculateThresholdLength(s[0], threshold) + calculateThresholdLength(s[1], threshold);
    }

    // if(topLevel){
    //     cache.thresholdLengths[segmentID(seg)] = re;
    // }

    return re;
}

function calculateSplitLength(seg, splits) {
    // Returned a cached result if exists
    // if(cache.splitLengths[segmentID(seg)] || cache.splitLengths[segmentID(getMirror(seg))]){
    //     return cache.splitLengths[segmentID(seg)];
    // }


    // Create an array of points that represents
    // this curve split evenly into lines
    const tSplit = 1 / splits;
    let points = [];
    let splitResult;
    
    points.push({x: seg.p1x, y: seg.p1y});
    
    for(let t=tSplit; t<1; t+=tSplit){
        splitResult = splitAtTime(seg, t);
        points.push({x: splitResult[1].p1x, y: splitResult[1].p1y});
    }
    
    points.push({x: seg.p4x, y: seg.p4y});

    // Add up all the line lengths
    let length = 0;
    let p1;
    let p2;

    for(let p=0; p<points.length-2; p++){
        p1 = points[p];
        p2 = points[p+1];

        length += calculateLineLength(p1, p2);
    }

    // cache.splitLengths[segmentID(seg)] = length;

    return length;
}

/**
 * Assuming 1000 baseline, calculate an area of a right triangle
 * p and h are the non-right-angle points
 * @param {object} p - x/y point
 * @param {object} h - x/y handle
 */
function calculateTriangleArea(p, h) {
    let height = h.y - p.y;
    let width = h.x - p.x;

    return Math.abs((height*width)/2);
}

/**
 * Returns the mirror image of the passed segment
 * Mirrors have the same length, so this optimizes cache returns
 * @param {object} seg - Bezier segment object
 */
function getMirror(seg){
    return {
        'p1x': seg.p4x,
        'p1y': seg.p4y,
        'p2x': seg.p3x,
        'p2y': seg.p3y,
        'p3x': seg.p2x,
        'p3y': seg.p2y,
        'p4x': seg.p1x,
        'p4y': seg.p1y,
    };
}
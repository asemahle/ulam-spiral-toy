// Data for the presets shown in the control panel

// Maps names to presets in the PRESETS object
const PRESET_OPTIONS = {
    'Choose a Preset...': -1,
    'Default': 0,
    'Ulam Spiral': 1,
    'Yatsko (line to sqrt(x))': 2,
    'Line to 4x': 3,
    'Animated Yatsko': 4,
    'Function of w, y, z': 5,
    'Highlight Squares': 6,
    'Highlight Fibonacci': 7,
    'Highlight Triangular': 8,
    'Quadratic Residue': 9,
    'Sine Dance': 10
}

const CIRCLE_CODE_PREAMBLE = `/** 
 * Inputs: values     an array of n+1 values, all starting at 0 (white)
 *         t          time (ms). "Animate" must be toggled
 *         w, y, z    controlled by Advanced Settings
 *         n          number of the last point on the spiral
 *
`
const LINE_CODE_PREAMBLE = `/** 
 * Inputs: x          a number on the number spiral
 *         t          time (ms). "Animate" must be toggled
 *         w, y, z    controlled by Advanced Settings
 *         n          number of the last point on the spiral
 *
`

const CIRCLE_CODES = {
    primes: ` * Prime numbers set to 1
 */
// Neither 0 nor 1 are prime
values[0] = -1; values[1] = -1
// Sieve of Eratosthenes
let s = Math.sqrt(n)
for (let i = 2; i <= s; i++) {
    if (values[i] === 0) {
        for (let j = 0; i*i + i*j <= n; j++) {
            values[i*i + i*j] = -1
        }
    }
}
// currently, primes are 0, others are -1
// need to increment each value by 1 to finish
return values.map((i) => i+1)`,
    squares: ` * Square numbers set to 1
 */
for (let i = 0; i*i <= n; i++) {
    values[i*i] = 1
}
return values`,
    fib: ` * Fibonacci numbers set to 1
 */
values[0] = 1; values[1] = 1
let [a,b] = [0,1]
while (a+b <= n) {
    values[a+b] = 1
    let c = b
    b = a + b
    a = c
}
return values`,
    tri: ` * Triangular numbers set to 1
 */
let i = 1
while ((i * (i + 1))/2 <= n) {
    values[(i * (i + 1))/2] = 1
    i++
}
return values`,
    quadraticResidue: ` * Quadratic residues mod n are set to 1
 */
for (let i = 0; i <= n; i++) {
    values[(i*i) % n] = 1
}
return values`,
    sineDance: ` * Circles are shaded by a sine function over time
 */
for (let i = 0; i <= n; i++) {
    values[i] = Math.max(0, Math.sin(i*0.1 + t*0.001))
}
return values`
}

const LINE_CODES = {
    spiral: ` * Draw line from x to x + 1
 */
return x + 1`,
    sqrt: ` * Draw line from x to the square root of x
 */
return Math.sqrt(x)`,
    timesFour: ` * Draw line from x to 4 * x
 */
return 4 * x`,
    animatedYatsko: ` * Draw line from x to a power of x. 
 * The power changes over time (notice the 't' parameter)
 */
let power = (Math.cos(t * 0.000015) + 1)/2
return Math.pow(x, power)`,
    wyzFunc: ` * Draws lines using the function shown
 * Try playing with the w, y, z sliders in the Advanced settings
 *    w   causes big changes
 *    y   causes medium changes
 *    z   causes small changes
 */
return 4 * x * w * (1/10 * y + 9/10)  *  (1/100 * z + 99/100)`,
    quadraticResidue: ` * Draws lines from x to x^2 mod the number of points
 * This means that quadratic residues have many lines going in
 */
return (x*x) % n`
}

// Add the preamble to each function
for (let key in CIRCLE_CODES) {
    CIRCLE_CODES[key] = CIRCLE_CODE_PREAMBLE + CIRCLE_CODES[key]
}
for (let key in LINE_CODES) {
    LINE_CODES[key] = LINE_CODE_PREAMBLE + LINE_CODES[key]
}

// Other presets override these settings
const DEFAULT_PRESET = {
    preset: -1,
    size: 10,
    offset: 1,
    zoom: 1,
    showCircles: true,
    showCircleBorders: true,
    circleRadius: 5,
    showLines: true,
    lineOpacity: 1,
    circleCode: CIRCLE_CODES.primes,
    lineCode: LINE_CODES.spiral,
    animate: false,
    speed: 1,
    w: 1,
    y: 1,
    z: 1
}

// These are the presets.
const PRESETS = [
    /** Default **/
    DEFAULT_PRESET,
    /** Ulam Spiral **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        showCircleBorders: false,
        circleRadius: 2.3,
        showLines: false,
    }),
    /** Jacob Yatsko **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        offset: 0,
        showCircles: false,
        showCircleBorders: false,
        circleRadius: 2.3,
        lineOpacity: 0.032,
        lineCode: LINE_CODES.sqrt
    }),
    /** Times 4 **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        offset: 0,
        showCircles: false,
        showCircleBorders: false,
        circleRadius: 2.3,
        lineOpacity: 0.129,
        lineCode: LINE_CODES.timesFour
    }),
    /** Animated Yatsko **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        offset: 0,
        showCircles: false,
        showCircleBorders: false,
        circleRadius: 2.3,
        lineOpacity: 0.032,
        lineCode: LINE_CODES.animatedYatsko,
        animate: true
    }),
    /** Function of w, y, z **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        offset: 0,
        showCircles: false,
        showCircleBorders: false,
        circleRadius: 2.3,
        lineOpacity: 0.08,
        lineCode: LINE_CODES.wyzFunc,
        w: 0.258,
        y: 0.428,
        z: 0.646
    }),
    /** Highlight Squares **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        circleRadius: 2.3,
        showLines: false,
        circleCode: CIRCLE_CODES.squares
    }),
    /** Highlight Fibonacci **/
    Object.assign({}, DEFAULT_PRESET, {
        offset: 0,
        size: 60,
        circleRadius: 2.3,
        showLines: false,
        circleCode: CIRCLE_CODES.fib
    }),
    /** Highlight Triangular **/
    Object.assign({}, DEFAULT_PRESET, {
        offset: 0,
        size: 100,
        circleRadius: 2.3,
        showLines: false,
        showCircleBorders: false,
        circleCode: CIRCLE_CODES.tri
    }),
    /** Quadratic Residue **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 40,
        offset: 1,
        showCircleBorders: false,
        circleRadius: 1.3,
        lineOpacity: 0.091,
        lineCode: LINE_CODES.quadraticResidue,
        circleCode: CIRCLE_CODES.quadraticResidue
    }),
    /** Sine Dance **/
    Object.assign({}, DEFAULT_PRESET, {
        size: 60,
        showCircleBorders: false,
        circleRadius: 2.1,
        lineOpacity: 0.25,
        circleCode: CIRCLE_CODES.sineDance,
        animate: true
    })
]
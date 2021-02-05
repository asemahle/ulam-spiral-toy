// Setup canvas
const svg = document.getElementById('draw-area')
const w = 500
const h = 500

// Setup Code Mirror
// These variables are both null because the code mirror editors
//   are hidden when the application runs. Code mirror has weird
//   bugs if you try to create an editor in a hidden region
// These get populated with code mirror editors the first time
//   that those editors appear on screen
//   (eg., click "Edit Circle Fill Function")
let circleCMEditor = null //code mirror editor for the circle function
let lineCMEditor = null //code mirror editor for the line function

// Setup simulation
const params = Object.assign({}, PRESETS[0]) //default parameters for the simulation
const monitors = { t: 0 } //allows Tweakpane to monitor the time variable
let spiral = new NumberSpiral(0, params.size, w, h)
spiral.setZoom(params.zoom)
let map = spiral.getCoordinateMap()

// These are user defined functions, built from strings
// They determine which circles are filled in, and how lines should connect points
let circleFunc = new UserFunction(
    params.circleCode,
    'Circle Fill',
    '"use strict"; let [values, t, w, y, z, n] = arguments;')
let connectionFunc = new UserFunction(
    params.lineCode,
    'Line Connection',
    '"use strict"; let [x, t, w, y, z, n] = arguments;')

let circles = []
let lines = []
for (let i = 0; i <= 100**2; i++) {
    circles.push(add(svg, 'circle'))
    lines.push(add(svg, 'path'))
}

/*************************************
 *       SIMULATION DRAW LOOP       **
 *************************************/
let refreshSpiral = true // flag. If true, rebuild spiral from params next frame
let refreshCanvas = true // flag. If true, redraw canvas next frame
let time;
let elapsed;
let loop = (timestamp) => {
    if (time === undefined) {
        time = timestamp
        elapsed = 0
    }
    if (params.animate) {
        // time only progresses if the "animate" parameter is set
        elapsed += ((timestamp - time) * params.speed)
    }
    time = timestamp
    monitors.t = elapsed //allows current time to be displayed in Tweakpane

    if (refreshSpiral) {
        spiral.offset = params.offset
        spiral.size = params.size
        spiral.setZoom(params.zoom)
        map = spiral.getCoordinateMap()
        refreshSpiral = false
    }

    if (params.animate || refreshCanvas) {
        let max = spiral.maxValue()
        if (params.showCircles) {
            let values = []
            for (let i = 0; i <= max; i++) values.push(0)
            values = circleFunc.run(values, elapsed, params.w, params.y, params.z, max)
            for (let i = 0; i < map.length; i++) {
                let shade = values[i]
                let point = map[i]
                setAttrs(circles[i], {
                    cx: point[0],
                    cy: point[1],
                    r: params.circleRadius,
                    fill: 'black',
                    'fill-opacity': shade,
                    stroke: params.showCircleBorders ? 'black' : 'none'
                })
            }
        }

        if (false && params.showLines) {
            for (let i = spiral.offset; i <= max; i++) {
                let to = connectionFunc.run(i, elapsed, params.w, params.y, params.z, max)
                if (to > max || to < 0) continue
                let p1 = map[Math.floor(to)]
                let p2 = map[Math.ceil(to)]
                let point = p1
                if (p1 !== p2) {
                    point = lerp2D(p1, p2, to - Math.floor(to))
                }
                addPath(ctx, map[i].concat(point),
                    {strokeStyle: 'black', globalAlpha: params.lineOpacity})
            }
        }
        refreshCanvas = false;
    }

    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)


/********************************************************
 **   BUTTONS FOR MODALS THAT LET THE USER EDIT CODE   **
 ********************************************************/
document.getElementById('circle-code-exit').onclick = () => {
    document.getElementById('circle-code').classList.remove('show')
}
document.getElementById('circle-code-save').onclick = () => {
    document.getElementById('circle-code').classList.remove('show')
    params.circleCode = circleCMEditor.getValue()
    circleFunc.set(params.circleCode)
    refreshCanvas = true;
}
document.getElementById('line-code-exit').onclick = () => {
    document.getElementById('line-code').classList.remove('show')
}
document.getElementById('line-code-save').onclick = () => {
    document.getElementById('line-code').classList.remove('show')
    params.lineCode = lineCMEditor.getValue()
    connectionFunc.set(params.lineCode)
    refreshCanvas = true;
}


/***********************************************
 **    SETUP THE CONTROL PANEL (Tweakpane)    **
 ***********************************************/
const pane = new Tweakpane({
    title: 'Parameters',
    container: document.getElementById('container')
})
pane.addInput(params, 'preset', {
    options: PRESET_OPTIONS
}).on('change', (value) => {
    if (value !== -1) {
        Object.assign(params, PRESETS[value])
        refreshSpiral = true
        circleFunc.set(params.circleCode)
        connectionFunc.set(params.lineCode)
        time = undefined
        params.preset = -1
        pane.refresh()
    }
})
pane.addInput(params, 'size', {
    min: 2,
    max: 100,
    step: 1
}).on('change', () => refreshSpiral = true)
pane.addInput(params, 'zoom', {
    min: 1,
    max: 10,
}).on('change', () => refreshSpiral = true)
pane.addInput(params, 'offset', {
    label: 'start at',
    options: {
        zero: 0,
        one: 1
    }
}).on('change', () => refreshSpiral = true)
pane.addInput(params, 'showCircles')
pane.addInput(params, 'showCircleBorders')
pane.addInput(params, 'circleRadius', {
    min: 0,
    max: 20
})
pane.addInput(params, 'showLines')
pane.addInput(params, 'lineOpacity', {
    min: 0,
    max: 1,
    step: 0.001
})
const advancedSettings = pane.addFolder({
    title: 'Advanced Settings',
    expanded: true
})
advancedSettings.addButton({ title: 'Edit Circle Fill Function' }).on('click', () => {
    document.getElementById('circle-code').classList.add('show')
    let codeMirrorContainer = document.getElementById('circle-code-inner')
    if (codeMirrorContainer.childElementCount === 0) {
        circleCMEditor = CodeMirror(document.getElementById('circle-code-inner'), {
            value: params.circleCode,
            mode: 'javascript',
            lineNumbers: true,
            indentUnit: 4
        })
    }
    circleCMEditor.setValue(params.circleCode)
})
advancedSettings.addButton({ title: 'Edit Line Connection Function' }).on('click', () => {
    document.getElementById('line-code').classList.add('show')
    let codeMirrorContainer = document.getElementById('line-code-inner')
    if (codeMirrorContainer.childElementCount === 0) {
        lineCMEditor = CodeMirror(document.getElementById('line-code-inner'), {
            value: params.lineCode,
            mode: 'javascript',
            lineNumbers: true,
            indentUnit: 4
        })
    }
    lineCMEditor.setValue(params.lineCode)
})
advancedSettings.addButton({ title: 'Reset Time to 0' }).on('click', () => {
    time = undefined
})
advancedSettings.addMonitor(monitors, 't')
advancedSettings.addInput(params, 'animate')
advancedSettings.addInput(params, 'speed', {
    min: -5,
    max: 5
})
advancedSettings.addInput(params,'w', {
    min: 0,
    max: 1,
    step: 0.001
});
advancedSettings.addInput(params,'y', {
    min: 0,
    max: 1,
    step: 0.001
});
advancedSettings.addInput(params,'z', {
    min: 0,
    max: 1,
    step: 0.001
});
pane.on('change', () => { refreshCanvas = true })
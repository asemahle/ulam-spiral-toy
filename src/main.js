// Setup canvas
const canvas = document.getElementById('draw-area')
const ctx = canvas.getContext('2d')
const w = canvas.width
canvas.height = w
const h = canvas.height

// Setup Code Mirror
// Initially set to null because the CodeMirror editors
//   are hidden when the application starts. CodeMirror has weird
//   bugs if you try to create an editor in a hidden region
// These variables get populated on-demand the first time
//   that the editors appear on screen
//   (eg., when the user clicks "Edit Circle Fill Function")
let circleCMEditor = null //editor for the circle function
let lineCMEditor = null //editor for the line function

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
        ctx.clearRect(0,0,w,h)
        const max = spiral.maxValue()
        if (params.showCircles) {
            let values = []
            for (let i = 0; i <= max; i++) values.push(0)
            values = circleFunc.run(values, elapsed, params.w, params.y, params.z, max)
            for (let i = 0; i < map.length; i++) {
                const shade = values[i]
                const point = map[i]
                addCircle(ctx, point[0], point[1], params.circleRadius, {
                    fillStyle:  `rgba(0,0,0,${shade})`,
                    strokeStyle: params.showCircleBorders ? 'black' : null
                })
            }
        }

        if (params.showLines) {
            for (let i = spiral.offset; i <= max; i++) {
                const to = connectionFunc.run(i, elapsed, params.w, params.y, params.z, max)
                if (to > max || to < 0) continue
                const p1 = map[Math.floor(to)]
                const p2 = map[Math.ceil(to)]
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
    container: document.getElementById('container')
})
const mainSettings = pane.addFolder({
    title: 'Settings',
    expanded: true
})
mainSettings.addInput(params, 'preset', {
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
mainSettings.addInput(params, 'size', {
    min: 2,
    max: 100,
    step: 1
}).on('change', () => refreshSpiral = true)
mainSettings.addInput(params, 'zoom', {
    min: 1,
    max: 10,
}).on('change', () => refreshSpiral = true)
mainSettings.addInput(params, 'offset', {
    label: 'start at',
    options: {
        zero: 0,
        one: 1
    }
}).on('change', () => refreshSpiral = true)
mainSettings.addInput(params, 'showCircles')
mainSettings.addInput(params, 'showCircleBorders')
mainSettings.addInput(params, 'circleRadius', {
    min: 0,
    max: 20
})
mainSettings.addInput(params, 'showLines')
mainSettings.addInput(params, 'lineOpacity', {
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
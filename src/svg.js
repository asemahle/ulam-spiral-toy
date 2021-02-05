let add = (svg, type, attrs) => {
    let ns = 'http://www.w3.org/2000/svg'
    let elem = document.createElementNS(ns, type)
    setAttrs(elem, attrs)
    svg.appendChild(elem)
    return elem
}

let setAttrs = (svg, attrs) => {
    for (let attr in attrs) {
        svg.setAttribute(String(attr), String(attrs[attr]))
    }
}

let ptsToLine = (pts, loop=false) => {
    let d = 'M ' + String(pts[0]) + ' ' + String(pts[1])
    for (let i = 2; i < pts.length - 1; i += 2) {
        d += ' L ' + String(pts[i]) + ' ' + String(pts[i+1])
    }
    if (loop) {
        d += ' Z'
    }
    return d
}
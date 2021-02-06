// Contains functions used for drawing on a canvas


/**
 * Set attributes on an object (such as a canvas context)
 *   and return the old values for those attributes
 * @param ctx   the object
 * @param attrs   the attributes
 * @returns {[]}   the old attributes
 */
function setAttrs(ctx, attrs) {
    const oldAttrs = []
    for (let key in attrs) {
        oldAttrs.push(ctx[key])
        ctx[key] = attrs[key]
    }
    return oldAttrs
}

/**
 * Resets the state of an object that was changed using "setAttrs(ctx, attrs)"
 * @param ctx   the object
 * @param attrs   the attrs originally passed to setAttrs
 * @param oldAttrs   the value returned by the original call to setAttrs
 */
function unsetAttrs(ctx, attrs, oldAttrs) {
    let i = 0
    for (let key in attrs) {
        ctx[key] = oldAttrs[i]
        i++
    }
}

/**
 * Draws a path to the provided canvas context (ctx)
 * Preserves canvas context: any changes made to ctx are
 *   undone before the function returns.
 * @param ctx   canvas context
 * @param pts   list of numbers, representing points.
 *              E.g [0,1,2,3] represents point (0,1) then (2,3)
 * @param attrs   apply these attrs to the ctx before drawing
 *                these changes to ctx are undone after drawing
 * @param loop   closes the path (forming a loop) if true
 */
function addPath(ctx, pts, attrs, loop=false) {
    const oldAttrs = setAttrs(ctx, attrs)
    ctx.beginPath()
    for (let i = 0; i < pts.length-1; i += 2){
        ctx.lineTo(pts[i], pts[i+1])
    }
    if (loop) ctx.closePath()
    if (attrs.strokeStyle != null) {
        ctx.stroke()
    }
    if (attrs.fillStyle != null) {
        ctx.fill()
    }
    unsetAttrs(ctx, attrs, oldAttrs)
}

/**
 * Draws a circle to the provided canvas context (ctx)
 * Preserves canvas context: any changes made to ctx are
 *   undone before the function returns.
 * @param ctx  canvas context
 * @param x    x position (pixels)
 * @param y    y position (pixels)
 * @param rad   radius
 * @param attrs   apply these attrs to the ctx before drawing
 *                these changes to ctx are undone after drawing
 */
function addCircle(ctx, x, y, rad, attrs) {
    const oldAttrs = setAttrs(ctx, attrs)
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, 2 * Math.PI)
    if (attrs.strokeStyle != null) {
        ctx.stroke()
    }
    if (attrs.fillStyle != null ) {
        ctx.fill()
    }
    unsetAttrs(ctx, attrs, oldAttrs)
}
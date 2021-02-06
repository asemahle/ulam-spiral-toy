/**
 * Maps points on a number spiral to a region
 * The number of points along an edge of the spiral is defined by "size"
 *   and the spiral is stretched to fit a region with dimensions "width" by "height".
 * @param offset  the first number in the spiral. Cannot be negative
 * @param size  number of points along an edge of the spiral
 * @param width  width of the region
 * @param height  height of the region
 * @param margin  left, right, top, and bottom margin (one number)
 * @constructor
 */
function NumberSpiral(offset, size, width, height, margin=10) {
    this.offset = offset
    this.size = Math.max(size, 2)
    this.width = width
    this.height = height
    this.margin = margin
}

/**
 * Returns the cartesian coordinates of point i on the number spiral.
 * Eg., 0 => (0,0); 1 => (1,0); 2 => (1,1); etc...
 * @param i
 * @returns {number[]}
 */
NumberSpiral.prototype.getCartesianCoords = function(i) {
    i = Math.max(0, i - this.offset)
    const k = Math.floor(Math.sqrt(i))
    const j = i - k*k
    const verticalOffset = Math.min(j, k)
    const horizontalOffset = Math.max(0, j - verticalOffset)
    return k % 2 ?
        [(k + 1) / 2 - horizontalOffset, (1 - k) / 2 + verticalOffset] :
        [-k / 2 + horizontalOffset, k / 2 - verticalOffset]
}

/**
 * Returns the coordinates of point i on the number spiral
 *   with respect to a region with dimensions width by height.
 * @param i
 * @returns {number[]}
 */
NumberSpiral.prototype.getCoords = function(i) {
    const cartesianCoords = this.getCartesianCoords(i)
    const vspace = (this.height - this.margin*2) / (this.size - 1)
    const hspace = (this.width - this.margin*2) / (this.size - 1)
    const offset = this.size % 2 ?  //location of 0
        [((this.size-1)/2) * hspace, ((this.size-1)/2) * vspace] :
        [(this.size/2 - 1)* hspace, (this.size/2) * vspace]
    return [
        this.margin + offset[0] + cartesianCoords[0]*hspace,
        this. margin + offset[1] - cartesianCoords[1]*vspace
    ]

}

/**
 * Returns an array of points (arrays with two items [x, y]).
 * The point in the ith position corresponds to the coordinate of the
 *   number i on the spiral.
 *  The returned array contains this.maxValue() points.
 * @returns {[]}
 */
NumberSpiral.prototype.getCoordinateMap = function() {
    const maxValue = this.maxValue()
    const map = []
    const zeroCoords = this.getCoords(0)
    for (let i = 0; i < this.offset; i++) {
        map.push(zeroCoords)
    }
    for (let i = this.offset; i <= maxValue; i++) {
        map.push(this.getCoords(i))
    }
    return map
}

/**
 * Returns the value of the maximum number represented in this spiral
 * @returns {*}
 */
NumberSpiral.prototype.maxValue = function() {
    return this.size * this.size - 1 + this.offset
}

/**
 * Achieves a faux-zoom by setting negative margins
 * @param zoom
 */
NumberSpiral.prototype.setZoom = function(zoom) {
    this.margin = -(this.width*(zoom - 1)) + 10
}
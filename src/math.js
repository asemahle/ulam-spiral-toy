/**
 * Returns a point between p1 and p2 using linear interpolation
 * @param p1
 * @param p2
 * @param f   the weight of interpolation
 *            f = 0 => p1 is returned
 *            f = 1 => p2 is returned
 *            f = .5 => the point halfway between p1 and p2 is returned
 * @returns {*[]}
 */
function lerp2D(p1, p2, f) {
    let dx = p2[0] - p1[0]
    let dy = p2[1] - p1[1]
    return [p1[0] + dx * f, p1[1] + dy * f]
}
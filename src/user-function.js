/**
 * Holds a function created by the user.
 * Use the "set" method on a string to create a function
 * Use the "run" method to run the most recently set function.
 * If an error occurs (the user wrote a bad function),
 *   then an alert is shown,
 *   and we try to rollback to a previous function.
 * @param code  String. Starting code for the function
 * @param name  A name for logging purposes
 * @param prefix  A prefix for the user's code
 * @constructor
 */
function UserFunction(code, name, prefix) {
    this.prefix = prefix
    this.errorMsg = `Error in ${name} function! Fix it or choose a preset. \nThe error was logged to console`
    this.stack = [this.generateFunction(code)]
    this.function = this.stack[0]
}

/**
 * Generates a function from code.
 * Alerts the user if there's an error.
 * @param code   String
 * @returns {f}   A function
 */
UserFunction.prototype.generateFunction = function(code) {
    let f = () => {} //default return value if all else fails
    try {
        f = Function(`
                ${this.prefix}
                ${code}
            `)
    } catch (e) {
        alert(this.errorMsg)
        console.error(e)
        // Try to rollback to previous function
        if (this.stack !== undefined && this.stack.length > 1) {
            f = this.stack[this.stack.length - 1]
        }
    }
    return f
}
/**
 * Sets up a new user function from code.
 * Alerts the user if there's an error
 * @param code   String
 */
UserFunction.prototype.set = function(code) {
    const f = this.generateFunction(code)
    if (f.toString() === this.function.toString()) return //new function is identical to current
    this.stack.push(f)
    this.function = f
}
/**
 * Calls the user function, passing in arguments
 * Alerts the user if there's an error
 * @returns {*}   Whatever the user function returns
 */
UserFunction.prototype.run = function() {
    const stackSize = this.stack.length
    for (let i = 0; i < stackSize; i++) {
        try {
            return this.function(...arguments)
        } catch(e) {
            alert(this.errorMsg)
            console.error(e)
            this.stack.pop()
            this.function = this.stack[this.stack.length - 1]
        }
    }
    alert("Fatal error trying to run user function: could not return to a good state")
    return null
}
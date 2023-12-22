class CancelablePromise extends Promise {
    constructor(executor) {
        super(executor)
        this.isCanceled = false
        this.cancel = this.cancel.bind(this)
        this.then = this.then.bind(this)
    }

    cancel() {
        this.isCanceled = true
    }

    then(onFulfilled, onRejected) {
        if (
            (typeof onFulfilled !== 'undefined' || typeof onRejected !== 'undefined') &&
            typeof onFulfilled !== 'function' && typeof onRejected !== 'function'
        ) {
            throw new Error('Wrong argument')
        }
        return super.then(onFulfilled, onRejected)
    }
}

module.exports = CancelablePromise

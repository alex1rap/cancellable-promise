class CancelablePromise {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new Error("Executor must be a function");
    }

    this.isCanceled = false;
    this.cancel = this.cancel.bind(this);

    this.executor = (onFulfilled, onRejected) => {
      if (!this.isCanceled) {
        try {
          executor(
            (value) => {
              if (!this.isCanceled) {
                onFulfilled(value);
              }
            },
            (reason) => {
              if (!this.isCanceled) {
                onRejected(reason);
              }
            },
          );
        } catch (error) {
          onRejected(error);
        }
      } else {
        onRejected({ isCanceled: true });
      }
    };

    this.promise = new Promise((resolve, reject) => {
      this.executor(
        (value) => {
          if (!this.isCanceled) {
            resolve(value);
          } else {
            reject({ isCanceled: true });
          }
        },
        (reason) => {
          if (!this.isCanceled) {
            reject(reason);
          } else {
            reject({ isCanceled: true });
          }
        },
      );
    });
  }

  cancel() {
    this.isCanceled = true;
  }

  then(onFulfilled, onRejected) {
    return new CancelablePromise((resolve, reject) => {
      this.promise.then(
        (value) => {
          if (this.isCanceled) {
            reject({ isCanceled: true });
          } else {
            try {
              resolve(onFulfilled ? onFulfilled(value) : value);
            } catch (error) {
              reject(error);
            }
          }
        },
        (reason) => {
          if (onRejected) {
            try {
              resolve(onRejected(reason));
            } catch (error) {
              reject(error);
            }
          } else {
            reject(reason);
          }
        },
      );
    });
  }

  execute(onFulfilled, onRejected) {
    this.executor(onFulfilled || (() => {}), onRejected || (() => {}));
  }

  catch(onRejected) {
    return new CancelablePromise((resolve, reject) => {
      this.promise.catch((reason) => {
        if (this.isCanceled) {
          reject({ isCanceled: true });
        } else {
          try {
            resolve(onRejected ? onRejected(reason) : reason);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  finally(onFinally) {
    return new CancelablePromise((resolve, reject) => {
      this.promise.finally(() => {
        if (this.isCanceled) {
          reject({ isCanceled: true });
        } else {
          try {
            onFinally();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
}

module.exports = CancelablePromise;

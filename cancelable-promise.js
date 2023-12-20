class CancelablePromise {
  constructor(executor) {
    this.isCanceled = false;
    this.promise = new Promise((resolve, reject) => {
      this.executor = (onFulfilled, onRejected) => {
        let logIsCancelled = false;
        if (!this.isCanceled) {
          executor(
            (value) => {
              if (!this.isCanceled) {
                resolve(value);
              }
            },
            (reason) => {
              if (!this.isCanceled) {
                reject(reason);
              }
            }
          );
        }
      };
    });

    this.cancel = this.cancel.bind(this);
    this.execute = this.execute.bind(this);
  }

  cancel() {
    this.isCanceled = true;
  }

  execute(onFulfilled, onRejected) {
    this.executor(onFulfilled, onRejected);
  }

  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }

  finally(onFinally) {
    return this.promise.finally(onFinally);
  }
}

// Приклад використання:
let executeAfter =  Math.random() * 4000 + 1000;
let cancelAfter = Math.random() * 4000 + 1300;

console.log({executeAfter, cancelAfter});

const cancelablePromise = new CancelablePromise((resolve, reject) => {
  setTimeout(() => {
    resolve('Проміс виконано');
  }, executeAfter);
});

cancelablePromise.execute(
  (result) => console.log(result),
  (error) => console.error(error)
); // Запуск виконання

setTimeout(() => {
    // Для скасування ланцюга промісів перед виконанням
    cancelablePromise.cancel();
    console.log('Спроба скасувати проміс');
  }, cancelAfter);

// Використання then, catch та finally
cancelablePromise
  .then((result) => console.log(result))
  .catch((error) => console.error(error))
  .finally(() => console.log('Блок finally виконано'));

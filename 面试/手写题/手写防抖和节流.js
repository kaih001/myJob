function debounce(fn, wait, immediate) {
  let timeout = null;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout) {
      clearTimeout(timeout);
    }
    if (immediate) {
      let canNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (canNow) {
        fn.apply(context, args);
      }
    } else {
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    }
  };
}
function debounce1(fn, wait, immediate) {
  return function () {
    const context = this;
    const args = arguments;
    let timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    if (immediate) {
      canNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(context, args);
      }, wait);
      if (canNow) {
        fn.apply(context, args);
      }
    } else {
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    }
  };
}
function debounce2(fn, wait, immediate) {
  return function () {
    let timeout = null;
    const context = this;
    const args = Array.from(arguments);
    if (timeout) {
      clearTimeout(timeout);
    }
    if (immediate) {
      const canNow = !timeout;
      if (canNow) {
        fn.apply(context, args);
      }
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
    } else {
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    }
  };
}
function throttled(fn, wait) {
  let context, args;
  let prevTime = 0;
  return function () {
    context = this;
    args = arguments;
    let now = +new Date();
    if (now - prevTime > wait) {
      fn.apply(context, args);
      prevTime = now;
    }
  };
}
function throttled1(fn, wait) {
  return function () {
    const context = this;
    const args = arguments;
    let prevTime = 0;
    let now = +new Date();
    let ram = now - prevTime;
    if (ram > wait) {
      fn.apply(context, args);
      prevTime = now;
    }
  };
}
function throttled2(fn, wait) {
  return function () {
    const context = this;
    const args = Array.from(arguments);
    let now = +new Date();
    let prevTime = 0;
    if (now - prevTime > wait) {
      fn.apply(context, args);
      prevTime = now;
    }
  };
}
function throttledTimout(fn, wait) {
  let context, args;
  let timeout = null;
  return function () {
    context = this;
    args = arguments;
    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(context, args);
      }, wait);
    }
  };
}
function throttledTimout1(fn, wait) {
  return function () {
    const context = this;
    const args = Array.from(arguments);
    let timeout = null;
    if (!timeout) {
      timeout = setTimeout(function () {
        fn.apply(context, args);
        timeout = null;
      }, wait);
    }
  };
}
function throttledTimout1(fn, wait) {
  return function () {
    const context = this;
    const args = arguments;
    let timeout;
    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(context, wait);
      }, wait);
    }
  };
}
function throttleTimeoutAndTime(fn, wait) {
  let prevTime = 0;
  return function () {
    const context = this;
    const args = arguments;
    let timeout;
    let now = +new Date();
    let ram = wait - (now - prevTime);
    if (ram <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      fn.apply(context, args);
      prevTime = now;
    } else if (!timeout) {
      timeout = setTimeout(function () {
        fn.apply(context, args);
        prevTime = +new Date();
        timeout = null;
      }, ram);
    }
  };
}

class GestureController {
  constructor(element) {
    this.element = element || document.body;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.enabled = true;

    this.handlers = {
      swipeLeft: null,
      swipeRight: null,
      swipeUp: null,
      tap: null,
      doubleTap: null
    };

    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.element.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });
    this.element.addEventListener('click', (e) => this.onClick(e));
  }

  onTouchStart(e) {
    if (!this.enabled) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartTime = Date.now();
  }

  onTouchEnd(e) {
    if (!this.enabled) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;

    if (deltaTime > 500) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > 50) {
      if (deltaX > 0 && this.handlers.swipeRight) {
        this.handlers.swipeRight();
      } else if (deltaX < 0 && this.handlers.swipeLeft) {
        this.handlers.swipeLeft();
      }
    } else if (absY > absX && absY > 50) {
      if (deltaY < 0 && this.handlers.swipeUp) {
        this.handlers.swipeUp();
      }
    }
  }

  onClick(e) {
    if (!this.enabled) return;
    const currentTime = Date.now();
    if (currentTime - this.lastTapTime < 300) {
      if (this.handlers.doubleTap) {
        this.handlers.doubleTap(e);
      }
    } else {
      setTimeout(() => {
        if (Date.now() - this.lastTapTime >= 300 && this.handlers.tap) {
          this.handlers.tap(e);
        }
      }, 300);
    }
    this.lastTapTime = currentTime;
  }

  onSwipeLeft(callback) {
    this.handlers.swipeLeft = callback;
  }

  onSwipeRight(callback) {
    this.handlers.swipeRight = callback;
  }

  onSwipeUp(callback) {
    this.handlers.swipeUp = callback;
  }

  onTap(callback) {
    this.handlers.tap = callback;
  }

  onDoubleTap(callback) {
    this.handlers.doubleTap = callback;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _helpers = require('./helpers');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Swiper = function Swiper(_ref) {
	var _this = this;

	var el = _ref.el,
	    options = _objectWithoutProperties(_ref, ['el']);

	_classCallCheck(this, Swiper);

	this.swipeable = (0, _helpers.getInitialState)();

	this.setupMouseListeners = function () {
		document.addEventListener('mousemove', _this.mouseMove);
		document.addEventListener('mouseup', _this.mouseUp);
	};

	this.cleanupMouseListeners = function () {
		// safe to call, if no match is found has no effect
		document.removeEventListener('mousemove', _this.mouseMove);
		document.removeEventListener('mouseup', _this.mouseUp);
	};

	this.eventStart = function (e) {
		// if more than a single touch don't track, for now...
		if (e.touches && e.touches.length > 1) return;

		var _getPosition = (0, _helpers.getPosition)(e),
		    x = _getPosition.x,
		    y = _getPosition.y;

		_this.swipeable = { start: Date.now(), x: x, y: y, swiping: false };
	};

	this.eventMove = function (e) {
		var _options = _this.options,
		    stopPropagation = _options.stopPropagation,
		    delta = _options.delta,
		    onSwiping = _options.onSwiping,
		    onSwipingLeft = _options.onSwipingLeft,
		    onSwipedLeft = _options.onSwipedLeft,
		    onSwipingRight = _options.onSwipingRight,
		    onSwipedRight = _options.onSwipedRight,
		    onSwipingUp = _options.onSwipingUp,
		    onSwipedUp = _options.onSwipedUp,
		    onSwipingDown = _options.onSwipingDown,
		    onSwipedDown = _options.onSwipedDown,
		    preventDefaultTouchmoveEvent = _options.preventDefaultTouchmoveEvent;

		if (!_this.swipeable.x || !_this.swipeable.y || e.touches && e.touches.length > 1) {
			return;
		}
		var pos = (0, _helpers.calculatePos)(e, _this.swipeable);

		// if swipe is under delta and we have not already started to track a swipe: return
		// if (
		// 	pos.absX < delta &&
		// 	pos.absY < delta &&
		// 	!this.swipeable.swiping
		// )
		// 	return;

		if (stopPropagation) e.stopPropagation();

		if (onSwiping) {
			onSwiping(e, pos.deltaX, pos.deltaY, pos.absX, pos.absY, pos.velocity);
		}

		var cancelablePageSwipe = false;
		if (pos.absX > pos.absY) {
			if (pos.deltaX > 0) {
				if (onSwipingLeft || onSwipedLeft) {
					onSwipingLeft && onSwipingLeft(e, pos.absX);

					cancelablePageSwipe = true;
				}
			} else if (onSwipingRight || onSwipedRight) {
				onSwipingRight && onSwipingRight(e, pos.absX);
				cancelablePageSwipe = true;
			}
		} else if (pos.deltaY > 0) {
			if (onSwipingUp || onSwipedUp) {
				onSwipingUp && onSwipingUp(e, pos.absY);
				cancelablePageSwipe = true;
			}
		} else if (onSwipingDown || onSwipedDown) {
			onSwipingDown && onSwipingDown(e, pos.absY);
			cancelablePageSwipe = true;
		}

		_this.swipeable.swiping = true;

		if (cancelablePageSwipe && preventDefaultTouchmoveEvent) e.preventDefault();
	};

	this.eventEnd = function (e) {
		var _options2 = _this.options,
		    stopPropagation = _options2.stopPropagation,
		    flickThreshold = _options2.flickThreshold,
		    onSwiped = _options2.onSwiped,
		    onSwipedLeft = _options2.onSwipedLeft,
		    onSwipedRight = _options2.onSwipedRight,
		    onSwipedUp = _options2.onSwipedUp,
		    onSwipedDown = _options2.onSwipedDown,
		    onTap = _options2.onTap;


		if (_this.swipeable.swiping) {
			var pos = (0, _helpers.calculatePos)(e, _this.swipeable);

			if (stopPropagation) e.stopPropagation();

			var isFlick = pos.velocity > flickThreshold;

			onSwiped && onSwiped(e, pos.deltaX, pos.deltaY, isFlick, pos.velocity);

			if (pos.absX > pos.absY) {
				if (pos.deltaX > 0) {
					onSwipedLeft && onSwipedLeft(e, pos.deltaX, isFlick);
				} else {
					onSwipedRight && onSwipedRight(e, pos.deltaX, isFlick);
				}
			} else if (pos.deltaY > 0) {
				onSwipedUp && onSwipedUp(e, pos.deltaY, isFlick);
			} else {
				onSwipedDown && onSwipedDown(e, pos.deltaY, isFlick);
			}
		} else {
			onTap && onTap(e);
		}

		// finished swipe tracking, reset swipeable state
		_this.swipeable = (0, _helpers.getInitialState)();
	};

	this.mouseDown = function (e) {
		if (!_this.options.trackMouse || e.type !== 'mousedown') {
			return;
		}
		// allow 'orig' props.onMouseDown to fire also
		// eslint-disable-next-line react/prop-types
		if (typeof _this.options.onMouseDown === 'function') _this.options.onMouseDown(e);

		// setup document listeners to track mouse movement outside <Swipeable>'s area
		_this.setupMouseListeners();

		_this.eventStart(e);
	};

	this.mouseMove = function (e) {
		_this.eventMove(e);
	};

	this.destroy = function () {
		_this.cleanupMouseListeners();
		_this.domNode.removeEventListener('touchstart', _this.eventStart);
		_this.domNode.removeEventListener('touchmove', _this.eventMove);
		_this.domNode.removeEventListener('touchend', _this.eventEnd);
		_this.domNode.removeEventListener('mousedown', _this.mouseDown);
	};

	this.setupMouseListeners();
	this.domNode = el;
	this.domNode.addEventListener('touchstart', this.eventStart);
	this.domNode.addEventListener('touchmove', this.eventMove);
	this.domNode.addEventListener('touchend', this.eventEnd);
	this.domNode.addEventListener('mousedown', this.mouseDown);
	this.options = options;
};

exports.default = Swiper;
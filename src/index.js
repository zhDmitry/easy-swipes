import { calculatePos, getInitialState, getPosition } from './helpers';

export default class Swiper {
	swipeable = getInitialState();
	constructor({ el, ...options }) {
		this.setupMouseListeners();
		this.domNode = el;
		this.domNode.addEventListener('touchstart', this.eventStart);
		this.domNode.addEventListener('touchmove', this.eventMove);
		this.domNode.addEventListener('touchend', this.eventEnd);
		this.domNode.addEventListener('mousedown', this.mouseDown);
		this.options = options;
	}
	setupMouseListeners = () => {
		document.addEventListener('mousemove', this.mouseMove);
		document.addEventListener('mouseup', this.mouseUp);
	};

	cleanupMouseListeners = () => {
		// safe to call, if no match is found has no effect
		document.removeEventListener('mousemove', this.mouseMove);
		document.removeEventListener('mouseup', this.mouseUp);
	};

	eventStart = e => {
		// if more than a single touch don't track, for now...
		if (e.touches && e.touches.length > 1) return;
		const { x, y } = getPosition(e);
		this.swipeable = { start: Date.now(), x, y, swiping: false };
	};

	eventMove = e => {
		const {
			stopPropagation,
			delta,
			onSwiping,
			onSwipingLeft,
			onSwipedLeft,
			onSwipingRight,
			onSwipedRight,
			onSwipingUp,
			onSwipedUp,
			onSwipingDown,
			onSwipedDown,
			preventDefaultTouchmoveEvent
		} = this.options;
		if (
			!this.swipeable.x ||
			!this.swipeable.y ||
			(e.touches && e.touches.length > 1)
		) {
			return;
		}
		const pos = calculatePos(e, this.swipeable);

		// if swipe is under delta and we have not already started to track a swipe: return
		// if (
		// 	pos.absX < delta &&
		// 	pos.absY < delta &&
		// 	!this.swipeable.swiping
		// )
		// 	return;

		if (stopPropagation) e.stopPropagation();

		if (onSwiping) {
			onSwiping(
				e,
				pos.deltaX,
				pos.deltaY,
				pos.absX,
				pos.absY,
				pos.velocity
			);
		}

		let cancelablePageSwipe = false;
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

		this.swipeable.swiping = true;

		if (cancelablePageSwipe && preventDefaultTouchmoveEvent)
			e.preventDefault();
	};

	eventEnd = e => {
		const {
			stopPropagation,
			flickThreshold,
			onSwiped,
			onSwipedLeft,
			onSwipedRight,
			onSwipedUp,
			onSwipedDown,
			onTap
		} = this.options;

		if (this.swipeable.swiping) {
			const pos = calculatePos(e, this.swipeable);

			if (stopPropagation) e.stopPropagation();

			const isFlick = pos.velocity > flickThreshold;

			onSwiped &&
				onSwiped(e, pos.deltaX, pos.deltaY, isFlick, pos.velocity);

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
		this.swipeable = getInitialState();
	};
	mouseDown = e => {
		if (!this.options.trackMouse || e.type !== 'mousedown') {
			return;
		}
		// allow 'orig' props.onMouseDown to fire also
		// eslint-disable-next-line react/prop-types
		if (typeof this.options.onMouseDown === 'function')
			this.options.onMouseDown(e);

		// setup document listeners to track mouse movement outside <Swipeable>'s area
		this.setupMouseListeners();

		this.eventStart(e);
	};

	mouseMove = e => {
		this.eventMove(e);
	};

	destroy = () => {
		this.cleanupMouseListeners();
		this.domNode.removeEventListener('touchstart', this.eventStart);
		this.domNode.removeEventListener('touchmove', this.eventMove);
		this.domNode.removeEventListener('touchend', this.eventEnd);
		this.domNode.removeEventListener('mousedown', this.mouseDown);
	};
}

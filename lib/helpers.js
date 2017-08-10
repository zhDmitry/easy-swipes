'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getMovingPosition = getMovingPosition;
exports.getPosition = getPosition;
exports.calculatePos = calculatePos;
exports.getInitialState = getInitialState;
function getMovingPosition(e) {
	// If not a touch, determine point from mouse coordinates
	return 'changedTouches' in e ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } : { x: e.clientX, y: e.clientY };
}
function getPosition(e) {
	// If not a touch, determine point from mouse coordinates
	return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
}

function calculatePos(e, state) {
	var _getMovingPosition = getMovingPosition(e),
	    x = _getMovingPosition.x,
	    y = _getMovingPosition.y;

	var deltaX = state.x - x;
	var deltaY = state.y - y;
	var absX = Math.abs(deltaX);
	var absY = Math.abs(deltaY);

	var time = Date.now() - state.start;
	var velocity = Math.sqrt(absX * absX + absY * absY) / time;

	return { deltaX: deltaX, deltaY: deltaY, absX: absX, absY: absY, velocity: velocity };
}

function getInitialState() {
	return {
		x: null,
		y: null,
		swiping: false,
		start: 0
	};
}
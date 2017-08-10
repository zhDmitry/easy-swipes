export function getMovingPosition(e) {
	// If not a touch, determine point from mouse coordinates
	return 'changedTouches' in e
		? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
		: { x: e.clientX, y: e.clientY };
}
export function getPosition(e) {
	// If not a touch, determine point from mouse coordinates
	return 'touches' in e
		? { x: e.touches[0].clientX, y: e.touches[0].clientY }
		: { x: e.clientX, y: e.clientY };
}

export function calculatePos(e, state) {
	const { x, y } = getMovingPosition(e);

	const deltaX = state.x - x;
	const deltaY = state.y - y;
	const absX = Math.abs(deltaX);
	const absY = Math.abs(deltaY);

	const time = Date.now() - state.start;
	const velocity = Math.sqrt(absX * absX + absY * absY) / time;

	return { deltaX, deltaY, absX, absY, velocity };
}

export function getInitialState() {
	return {
		x: null,
		y: null,
		swiping: false,
		start: 0
	};
}

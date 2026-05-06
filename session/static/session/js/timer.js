/**
 * timer.js - Timer logic for session tracking
 * Pure JavaScript timer controller with no DOM manipulation
 * Tracks elapsed time and provides start/pause/resume/stop functionality
 */

/**
 * TimerController - manages timer state and elapsed time
 * @class
 */
class TimerController {
	constructor() {
		this.elapsedSeconds = 0;
		this.isRunning = false;
		this.timerInterval = null;
	}

	/**
	 * Start the timer from 0 (only works if not already running)
	 */
	start() {
		if (this.isRunning) {
			console.warn("Timer is already running");
			return;
		}

		this.elapsedSeconds = 0;
		this.isRunning = true;

		this.timerInterval = setInterval(() => {
			this.elapsedSeconds += 1;
		}, 1000);
	}

	/**
	 * Pause the timer (stops incrementing but retains current time)
	 */
	pause() {
		if (!this.isRunning) {
			console.warn("Timer is not running");
			return;
		}

		this.isRunning = false;
		clearInterval(this.timerInterval);
		this.timerInterval = null;
	}

	/**
	 * Resume the timer from paused state
	 */
	resume() {
		if (this.isRunning) {
			console.warn("Timer is already running");
			return;
		}

		this.isRunning = true;

		this.timerInterval = setInterval(() => {
			this.elapsedSeconds += 1;
		}, 1000);
	}

	/**
	 * Stop the timer and reset to 0
	 * @returns {number} The total elapsed seconds before reset
	 */
	stop() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		this.isRunning = false;
		const totalElapsed = this.elapsedSeconds;
		this.elapsedSeconds = 0;

		return totalElapsed;
	}

	/**
	 * Get current elapsed seconds without stopping the timer
	 * @returns {number} Elapsed seconds
	 */
	getElapsed() {
		return this.elapsedSeconds;
	}

	/**
	 * Check if timer is currently running
	 * @returns {boolean} True if timer is active
	 */
	isActive() {
		return this.isRunning;
	}
}

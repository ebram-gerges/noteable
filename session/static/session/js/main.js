/**
 * main.js - Main entry point for session tracking app
 * Initializes timer, event listeners, and app state management
 */

// Global timer instance
let timer = new TimerController();

// Interval for updating timer display (every 100ms)
let displayUpdateInterval = null;

/**
 * Initialize the application on page load
 */
async function initApp() {
	console.log("Initializing session tracking app...");

	// Load categories from backend
	await loadCategories();

	// Load sessions from backend
	await loadSessions();

	// Set up event listeners
	setupEventListeners();

	// Initial button state
	updateButtonStates("startBtn", "pauseBtn", "endBtn", false);

	console.log("App initialized successfully");
}

/**
 * Load categories from backend and populate dropdown
 */
async function loadCategories() {
	try {
		showMessage("Loading categories...", "info");
		const categories = await fetchCategories();
		renderCategoryDropdown(categories);
		// Clear loading message if we got categories
		if (categories.length > 0) {
			const msgContainer = document.getElementById("messageContainer");
			if (msgContainer) msgContainer.innerHTML = "";
		}
	} catch (error) {
		console.error("Failed to load categories:", error);
		showMessage("Failed to load categories", "error");
	}
}

/**
 * Load sessions from backend and render list
 */
async function loadSessions() {
	try {
		const sessions = await fetchSessions();
		renderSessionsList(sessions);
	} catch (error) {
		console.error("Failed to load sessions:", error);
		showMessage("Failed to load sessions", "error");
	}
}

/**
 * Start the timer
 */
function onStartClick() {
	if (!timer.isActive()) {
		timer.start();
		updateButtonStates("startBtn", "pauseBtn", "endBtn", true);
		startDisplayUpdate();
		console.log("Timer started");
	}
}

/**
 * Pause the timer
 */
function onPauseClick() {
	if (timer.isActive()) {
		timer.pause();
		updateButtonStates("startBtn", "pauseBtn", "endBtn", false);
		stopDisplayUpdate();
		console.log("Timer paused");
	} else {
		// Resume if paused
		timer.resume();
		startDisplayUpdate();
		updateButtonStates("startBtn", "pauseBtn", "endBtn", true);
		console.log("Timer resumed");
	}
}

/**
 * End the session: validate, submit, and reset
 */
async function onEndClick() {
	// Validate form before submission
	const validation = validateForm();
	if (!validation.isValid) {
		showMessage(validation.message, "error");
		return;
	}

	// Get elapsed time before stopping timer
	const duration = timer.stop();
	stopDisplayUpdate();

	if (duration === 0) {
		showMessage("Session duration must be at least 1 second", "error");
		timer.start();
		updateButtonStates("startBtn", "pauseBtn", "endBtn", true);
		startDisplayUpdate();
		return;
	}

	// Get form data
	const { title, description, categoryId } = getFormData();

	// Submit session to backend
	try {
		showMessage("Saving session...", "info");
		await createSession(title, description, categoryId, duration);

		// Success feedback
		showMessage("Session saved successfully!", "success");

		// Reset UI
		clearForm();
		updateTimerDisplay(0);
		updateButtonStates("startBtn", "pauseBtn", "endBtn", false);

		// Reload sessions list
		await loadSessions();

		console.log(`Session created: ${title} (${duration}s)`);
	} catch (error) {
		console.error("Failed to create session:", error);
		showMessage(`Failed to save session: ${error.message}`, "error");

		// Reset UI on error
		updateTimerDisplay(0);
		updateButtonStates("startBtn", "pauseBtn", "endBtn", false);
	}
}

/**
 * Start updating timer display every 100ms
 */
function startDisplayUpdate() {
	if (!displayUpdateInterval) {
		displayUpdateInterval = setInterval(() => {
			updateTimerDisplay(timer.getElapsed());
		}, 100);
	}
}

/**
 * Stop updating timer display
 */
function stopDisplayUpdate() {
	if (displayUpdateInterval) {
		clearInterval(displayUpdateInterval);
		displayUpdateInterval = null;
	}
}

/**
 * Set up event listeners for all buttons and controls
 */
function setupEventListeners() {
	// Timer buttons
	document.getElementById("startBtn").addEventListener("click", onStartClick);
	document.getElementById("pauseBtn").addEventListener("click", onPauseClick);
	document.getElementById("endBtn").addEventListener("click", onEndClick);

	// Keyboard shortcuts
	document.addEventListener("keydown", (e) => {
		// Only trigger when not typing in an input
		if (
			e.target.tagName === "INPUT" ||
			e.target.tagName === "TEXTAREA" ||
			e.target.tagName === "SELECT"
		) {
			return;
		}

		if (e.code === "Space") {
			e.preventDefault();
			if (timer.isActive()) {
				onPauseClick();
			} else {
				onStartClick();
			}
		}
		if (e.code === "Enter") {
			e.preventDefault();
			onEndClick();
		}
	});
}

/**
 * Clean up resources when page unloads
 */
window.addEventListener("beforeunload", () => {
	stopDisplayUpdate();
	if (timer.isActive()) {
		timer.stop();
	}
});

/**
 * Initialize app when DOM is ready
 */
document.addEventListener("DOMContentLoaded", initApp);

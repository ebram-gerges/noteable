/**
 * ui.js - UI/DOM manipulation for session tracking app
 */

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDate(dateString) {
	if (!dateString) return "Unknown date";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Invalid date";
	return date.toLocaleString();
}

function updateTimerDisplay(seconds) {
	const timerDisplay = document.getElementById("timerDisplay");
	if (timerDisplay) {
		timerDisplay.textContent = formatTime(seconds);
	}
}

function renderCategoryDropdown(categories) {
	const categorySelect = document.getElementById("categorySelect");
	if (!categorySelect) {
		console.error("Category select element not found");
		return;
	}

	categorySelect.innerHTML = '<option value="">Select a category...</option>';

	categories.forEach((category) => {
		const option = document.createElement("option");
		option.value = category.id;
		option.textContent = category.name;
		categorySelect.appendChild(option);
	});
}

function renderSessionsList(sessions) {
	const sessionsList = document.getElementById("sessionsList");
	if (!sessionsList) {
		console.error("Sessions list container not found");
		return;
	}

	sessionsList.innerHTML = "";

	if (sessions.length === 0) {
		sessionsList.innerHTML =
			'<p class="empty-state">No sessions yet. Create one to get started!</p>';
		return;
	}

	sessions.forEach((session) => {
		const sessionItem = document.createElement("article");
		sessionItem.className = "session-item";
		sessionItem.dataset.sessionId = session.id;

		sessionItem.innerHTML = `
      <div class="session-header">
        <h3 class="session-title">${escapeHtml(session.title || "Untitled")}</h3>
        <span class="session-duration">${formatTime(session.duration || 0)}</span>
      </div>
      <p class="session-description">${escapeHtml(session.description || "")}</p>
      <div class="session-footer">
        <span class="session-category">${escapeHtml(session.category?.name || "Uncategorized")}</span>
        <div class="session-actions">
          <span class="session-date">${formatDate(session.created_at)}</span>
          <button class="btn-delete" data-session-id="${session.id}" title="Delete session">×</button>
        </div>
      </div>
    `;
		sessionsList.appendChild(sessionItem);
	});

	// Attach delete handlers
	document.querySelectorAll(".btn-delete").forEach((btn) => {
		btn.addEventListener("click", handleDeleteClick);
	});
}

async function handleDeleteClick(event) {
	event.stopPropagation();
	const button = event.target;
	const sessionId = button.dataset.sessionId;

	if (!sessionId) return;

	if (!confirm("Delete this session? This cannot be undone.")) {
		return;
	}

	// Disable button immediately
	button.disabled = true;
	button.textContent = "...";

	try {
		await deleteSession(sessionId);
		// Remove from DOM
		const sessionItem = button.closest(".session-item");
		if (sessionItem) {
			sessionItem.remove();
		}
		showMessage("Session deleted", "success");

		// Check if list is now empty
		const sessionsList = document.getElementById("sessionsList");
		if (sessionsList && sessionsList.children.length === 0) {
			sessionsList.innerHTML =
				'<p class="empty-state">No sessions yet. Create one to get started!</p>';
		}
	} catch (error) {
		console.error("Failed to delete session:", error);
		showMessage("Failed to delete session", "error");
		button.disabled = false;
		button.textContent = "×";
	}
}

function getFormData() {
	const titleInput = document.getElementById("titleInput");
	const descriptionInput = document.getElementById("descriptionInput");
	const categorySelect = document.getElementById("categorySelect");

	return {
		title: titleInput ? titleInput.value.trim() : "",
		description: descriptionInput ? descriptionInput.value.trim() : "",
		categoryId:
			categorySelect && categorySelect.value
				? parseInt(categorySelect.value, 10)
				: null,
	};
}

function clearForm() {
	const titleInput = document.getElementById("titleInput");
	const descriptionInput = document.getElementById("descriptionInput");
	const categorySelect = document.getElementById("categorySelect");

	if (titleInput) titleInput.value = "";
	if (descriptionInput) descriptionInput.value = "";
	if (categorySelect) categorySelect.value = "";
}

function showMessage(text, type = "info") {
	const messageContainer = document.getElementById("messageContainer");
	if (!messageContainer) {
		console.error("Message container not found");
		return;
	}

	messageContainer.innerHTML = "";

	if (!text) return;

	const message = document.createElement("div");
	message.className = `message message-${type}`;
	message.setAttribute("role", "status");
	message.textContent = text;

	messageContainer.appendChild(message);

	setTimeout(() => {
		if (messageContainer.contains(message)) {
			message.remove();
		}
	}, 5000);
}

function updateButtonStates(startBtnId, pauseBtnId, endBtnId, timerRunning) {
	const startBtn = document.getElementById(startBtnId);
	const pauseBtn = document.getElementById(pauseBtnId);
	const endBtn = document.getElementById(endBtnId);

	if (startBtn) startBtn.disabled = timerRunning;
	if (pauseBtn) pauseBtn.disabled = !timerRunning;
	if (endBtn) endBtn.disabled = false;
}

function escapeHtml(text) {
	if (text === null || text === undefined) return "";
	const div = document.createElement("div");
	div.textContent = String(text);
	return div.innerHTML;
}

function validateForm() {
	const { title, categoryId } = getFormData();

	if (!title) {
		return {
			isValid: false,
			message: "Title is required",
		};
	}

	if (!categoryId) {
		return {
			isValid: false,
			message: "Please select a category",
		};
	}

	return {
		isValid: true,
		message: "",
	};
}

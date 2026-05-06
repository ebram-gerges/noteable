/**
 * api.js - API and fetch utilities
 */

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === name + "=") {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function djangoFetch(url, options = {}) {
	const csrftoken = getCookie("csrftoken");
	const defaultOptions = {
		headers: {
			"X-CSRFToken": csrftoken,
			"Content-Type": "application/json",
			...options.headers,
		},
		mode: "same-origin",
		...options,
	};

	return fetch(url, defaultOptions).then((response) => {
		if (response.status === 401 || response.status === 403) {
			window.location.href = "/accounts/login/";
			return Promise.reject(new Error("Authentication required"));
		}
		return response;
	});
}

async function fetchCategories() {
	try {
		const response = await djangoFetch("/api/categories/");
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
		}
		const data = await response.json();
		return Array.isArray(data) ? data : data.results || [];
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
}

async function fetchSessions() {
	try {
		const response = await djangoFetch("/api/sessions/");
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: Failed to fetch sessions`);
		}
		const data = await response.json();
		return Array.isArray(data) ? data : data.results || [];
	} catch (error) {
		console.error("Error fetching sessions:", error);
		return [];
	}
}

async function createSession(title, description, categoryId, duration) {
	const payload = {
		title: title,
		description: description,
		category_id: categoryId,
		duration: duration,
	};

	try {
		const response = await djangoFetch("/api/sessions/add/", {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail ||
					errorData.error ||
					JSON.stringify(errorData) ||
					`HTTP ${response.status}: Failed to create session`,
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating session:", error);
		throw error;
	}
}

async function deleteSession(sessionId) {
	try {
		const response = await djangoFetch(`/api/sessions/delete/${sessionId}/`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.error || `HTTP ${response.status}: Failed to delete session`,
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error deleting session:", error);
		throw error;
	}
}

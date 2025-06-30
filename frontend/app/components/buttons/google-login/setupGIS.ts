type GisConfig = {
	clientId: string;
	parent: HTMLElement;
	onSuccess: (credential: string) => void;
	onError?: (error: Error) => void;
};

const initializeGIS = (config: GisConfig): void => {
	const { clientId, parent, onSuccess, onError } = config;

	if (!window.google || !parent) {
		return;
	}

	window.google.accounts.id.initialize({
		client_id: clientId,
		ux_mode: "popup",
		callback: (response) => {
			console.log("GIS callback invoked");
			if (response.credential) {
				console.log("✅ Successfully initialized Google Identity Service (GIS).");
				onSuccess(response.credential);
			} else {
				const error = new Error("❌ Failed to initialize Google Identity Service (GIS).");
				console.error(error.message);
				onError?.(error);
			}
		},
	});

	window.google.accounts.id.renderButton(parent, {
		theme: "outline",
		size: "large",
		width: 200,
		type: "standard",
		text: "signin_with"
	});
};

const loadGIS = (config: GisConfig): void => {
	const { clientId, parent, onSuccess, onError } = config;

	const script = document.createElement("script");
	script.src = import.meta.env.VITE_GOOGLE_GIS_CLIENT_URL;
	script.async = true;
	script.defer = true;

	script.onload = () => {
		console.log("✅ Successfully loaded Google GIS script.");
		initializeGIS({ clientId, parent, onSuccess, onError });
	};

	script.onerror = () => {
		console.error("❌ Failed to load Google GSI script.");
	};

	document.body.appendChild(script);
};

export const setupGIS = (config: GisConfig): void => {
	if (!window.google) {
		loadGIS(config);
	} else {
		initializeGIS(config);
	}
};

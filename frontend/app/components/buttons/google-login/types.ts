export type CredentialResponse = {
	credential: string;
	select_by: string;
	clientId?: string;
};

export type IdConfiguration = {
	client_id: string;				// App's client ID.
	callback: (response: CredentialResponse) => void;	// The JavaScript function that handles ID tokens. Google One Tap and the Sign In With Google button popup UX mode use this attribute.
	auto_select?: string;			// Enables automatic selection.
	login_uri?: string;				// The URL of your login endpoint. The Sign In With Google button redirect UX mode uses this attribute.
	native_callback?: string;		// The JavaScript function that handles password credentials.
	cancel_on_tap_outside?: string;	// Cancels the prompt if the user clicks outside the prompt.
	prompt_parent_id?: string;		// The DOM ID of the One Tap prompt container element
	nonce?: string;					// A random string for ID tokens
	context?: string;				// The title and words in the One Tap prompt
	state_cookie_domain?: string;	// If you need to call One Tap in the parent domain and its subdomains, pass the parent domain to this field so that a single shared cookie is used.
	ux_mode?: string;				// The Sign In With Google button UX flow
	allowed_parent_origin?: string;	// The origins that are allowed to embed the intermediate iframe. One Tap is run in the intermediate iframe mode if this field is present.
	intermediate_iframe_close_callback?: string;	// Overrides the default intermediate iframe behavior when users manually close One Tap.
	itp_support?: string;			// Enables upgraded One Tap UX on ITP browsers.
	login_hint?: string;			// Skip account selection by providing a user hint.
	hd?: string;					// Limit account selection by domain.
	use_fedcm_for_prompt?: string;	// Allow the browser to control user sign-in prompts and mediate the sign-in flow between your website and Google.
	use_fedcm_for_button?: string;	// This field determines if FedCM button UX should be used on Chrome (desktop M125+ and Android M128+). Defaults to false.
	button_auto_select?: string;
};

export type GsiButtonConfiguration = {
    type?: "standard" | "icon";
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: "signin_with" | "signup_with" | "continue_with" | "signup_with";
    shape?: "rectangular" | "pill" | "circle" | "square";
    logo_alignment?: "left" | "center";
    width?: string | number;
    locale?: string;
    click_listener?: () => void;
	state?: string
};

declare global {
	interface Window {
		google: {
			accounts: {
				id: {
					initialize: (config: IdConfiguration) => void;
					renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
					cancel: () => void;
				}
			}
		}
	}
}

export type GoogleLoginHandler = (credential: string) => void;

export type GoogleLoginButtonProps = {
	clientId: string;
	onLogin: GoogleLoginHandler;
	buttonConfig?: GsiButtonConfiguration
};

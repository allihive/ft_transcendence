import { useEffect, useRef, type JSX } from "react";
import type { GoogleLoginButtonProps } from "./types";
import { setupGIS } from "./setupGIS";

export function GoogleLoginButton(props: GoogleLoginButtonProps): JSX.Element {
	const divRef = useRef<HTMLDivElement>(null);
	const { clientId, onLogin } = props;

	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		setupGIS({ clientId, parent: divRef.current, onLogin });

		return () => {
			window.google?.accounts.id.cancel();
		};
	}, [clientId, onLogin]);

	return <div ref={divRef}></div>;
}

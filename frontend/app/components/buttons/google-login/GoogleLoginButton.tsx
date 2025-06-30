import { useEffect, useRef, type JSX } from "react";
import type { GoogleLoginButtonProps } from "./types";
import { setupGIS } from "./setupGIS";

export function GoogleLoginButton(props: GoogleLoginButtonProps): JSX.Element {
	const divRef = useRef<HTMLDivElement>(null);
	const { clientId, onSuccess, onError } = props;

	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		setupGIS({ clientId, parent: divRef.current, onSuccess, onError });

		return () => {
			window.google?.accounts.id.cancel();
		};
	}, [clientId, onSuccess, onError]);

	return <div ref={divRef}></div>;
}

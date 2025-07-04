import { Static, Type } from "@sinclair/typebox";

export const ImageFilenameDtoSchema = Type.Object(
	{
		filename: Type.String({
			pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\.(jpg|jpeg|png)$"
		})
	},
	{ additionalProperties: false }
);

export type ImageFilenameDto = Static<typeof ImageFilenameDtoSchema>;
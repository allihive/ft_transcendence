import { randomUUID } from "crypto";
import { FastifyPluginAsync } from "fastify";
import { createWriteStream } from "fs";
import { extname, join, resolve } from "path";
import { pipeline } from "stream/promises";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { ImageFilenameDto, ImageFilenameDtoSchema } from "./media.dto";
import { access, constants } from "fs/promises";
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export const mediaController: FastifyPluginAsync = async (app) => {
	const UPLOAD_DIR = process.env.UPLOAD_DIR!;

	app.get("/files/:filename", {
		schema: { params: ImageFilenameDtoSchema },
		handler: async (request, reply) => {
			const { filename } = request.params as ImageFilenameDto;

			try {
				await access(resolve(UPLOAD_DIR, filename), constants.R_OK);
			} catch (error) {
				throw new NotFoundException(filename);
			}

			return reply.sendFile(filename);
		}
	});

	app.post("/upload", async (request, reply) => {
		const file = await request.file();

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
			throw new BadRequestException("Unsupported file format. Only JPEG and PNG allowed.");
		}

		const uuidFilename = randomUUID() + extname(file.filename).toLowerCase();;
		const uploadPath = join(UPLOAD_DIR, uuidFilename);

		await pipeline(file.file, createWriteStream(uploadPath));
		return reply.status(200).send({ url: `/files/${uuidFilename}` });
	});
};

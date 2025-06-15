import * as bcrypt from "bcrypt";

export class CryptoService {
	private saltRounds: number;

	constructor(saltRounds: number = 10) {
		this.saltRounds = saltRounds;
	}

	hash(data: string): string {
		return bcrypt.hashSync(data, this.saltRounds)
	}

	compare(data: string, encrypted: string): boolean {
		return bcrypt.compareSync(data, encrypted);
	}
}

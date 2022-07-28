export const NOT_IMPLEMENTED = "Not implemented";
export const ARGUMENT_NULL = "Argument null";
export const INVALID_ARGUMENT = "Invalid argument";

export class NotImplementedError extends Error {
	constructor() {
		super(NOT_IMPLEMENTED);
	}
}

export class ArgumentNullError extends Error {
	constructor() {
		super(ARGUMENT_NULL);
	}
}

export class InvalidArgumentError extends Error {
	value: any;
	expectedType: string | undefined;
	constructor(value: any, expectedType?: string) {
		let message = INVALID_ARGUMENT;
		if (expectedType) message = message.concat(` expected: ${expectedType} value: ${value} `);
		else message = message.concat(` value: ${value}`);
		super(message);
		this.value = value;
		this.expectedType = expectedType;
	}
}

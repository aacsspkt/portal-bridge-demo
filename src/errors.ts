export const NOT_IMPLEMENTED = "Not implemented";
export const ARGUMENT_NULL_UNDEFINED = "Argument is null or undefined";
export const INVALID_ARGUMENT = "Invalid argument";

export class NotImplementedError extends Error {
	constructor() {
		super(NOT_IMPLEMENTED);
	}
}

export class ArgumentNullOrUndefinedError extends Error {
	constructor() {
		super(ARGUMENT_NULL_UNDEFINED);
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

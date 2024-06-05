function parse_from_remote_url(
	input_url: string,
	requestFn: (v: string) => Promise<any>,
): Promise<any>;

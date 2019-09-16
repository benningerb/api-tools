import { parse } from '.';

describe('parser', () => {
	describe('passthrough', () => {
		it('should return an empty object for unknown params', () => {
			expect(parse(`foo=bar`)).toEqual({});
		});
	});

	describe('unsupported', () => {
		it('should return an unsupported method error for unknown $-prefixed params', () => {
			expect(parse(`$foo=bar`)).toEqual({
				error: 'unsupported method: $foo=bar',
			});
		});
	});

	describe('$orderby', () => {
		it('should return an invalid $orderby error', () => {
			const error = 'invalid $orderby parameter';
			expect(parse(`$orderBy=`)).toEqual({ error });
			expect(parse(`$orderby=`)).toEqual({ error });
		});
		it('should order by lastname ascending by default', () => {
			expect(parse(`$orderBy=lastname`)).toEqual({
				$orderby: [{ type: 'asc', name: 'lastname' }],
			});
		});
		it('should order by dob descending, then by lastname ascending', () => {
			expect(parse(`$orderby=dob desc,lastname`)).toEqual({
				$orderby: [{ type: 'desc', name: 'dob' }, { type: 'asc', name: 'lastname' }],
			});
		});
	});

	describe('$filter', () => {
		describe('single', () => {
			it('should filter by lastname equal to "Smith"', () => {
				expect(parse(`$filter=lastname eq 'Smith'`)).toEqual({
					$filter: {
						type: 'eq',
						left: {
							type: 'property',
							name: 'lastname',
						},
						right: {
							type: 'literal',
							value: 'Smith',
						},
					},
				});
			});
			it('should filter by firstname not equal to "Bob"', () => {
				expect(parse(`$filter=firstname ne 'Bob'`)).toEqual({
					$filter: {
						type: 'ne',
						left: {
							type: 'property',
							name: 'firstname',
						},
						right: {
							type: 'literal',
							value: 'Bob',
						},
					},
				});
			});
			it('should filter by id greater than 42', () => {
				expect(parse(`$filter=id gt 42`)).toEqual({
					$filter: {
						type: 'gt',
						left: {
							type: 'property',
							name: 'id',
						},
						right: {
							type: 'literal',
							value: 42,
						},
					},
				});
			});
			it('should filter by firstname greater than or equal to "Stephen"', () => {
				expect(parse(`$filter=firstname ge 'Stephen'`)).toEqual({
					$filter: {
						type: 'ge',
						left: {
							type: 'property',
							name: 'firstname',
						},
						right: {
							type: 'literal',
							value: 'Stephen',
						},
					},
				});
			});
			it('should filter by dob less than "2019-01-01"', () => {
				expect(parse(`$filter=dob lt '2019-01-01'`)).toEqual({
					$filter: {
						type: 'lt',
						left: {
							type: 'property',
							name: 'dob',
						},
						right: {
							type: 'literal',
							value: '2019-01-01',
						},
					},
				});
			});
		});
		describe('compound', () => {
			it('should filter by pid greater than 10 and startDate less than "1970-01-01"', () => {
				expect(parse(`$filter=pid gt 10 and startDate lt '1970-01-01'`)).toEqual({
					$filter: {
						type: 'and',
						left: {
							type: 'gt',
							left: {
								type: 'property',
								name: 'pid',
							},
							right: {
								type: 'literal',
								value: 10,
							},
						},
						right: {
							type: 'lt',
							left: {
								type: 'property',
								name: 'startDate',
							},
							right: {
								type: 'literal',
								value: '1970-01-01',
							},
						},
					},
				});
			});
			it('should filter by firstName less than "E" or firstName greater than "X"', () => {
				expect(parse(`$filter=firstName lt 'E' or firstName gt 'X'`)).toEqual({
					$filter: {
						type: 'or',
						left: {
							type: 'lt',
							left: {
								type: 'property',
								name: 'firstName',
							},
							right: {
								type: 'literal',
								value: 'E',
							},
						},
						right: {
							type: 'gt',
							left: {
								type: 'property',
								name: 'firstName',
							},
							right: {
								type: 'literal',
								value: 'X',
							},
						},
					},
				});
			});
		});
		describe('complex', () => {
			it('should filter by (firstName less than "E" or firstName greater than "X") and dob greater than "1970-01-01"', () => {
				expect(parse(`$filter=(firstName lt 'E' or firstName gt 'X') and dob gt '1970-01-01'`)).toEqual({
					$filter: {
						type: 'and',
						left: {
							type: 'or',
							left: {
								type: 'lt',
								left: {
									type: 'property',
									name: 'firstName',
								},
								right: {
									type: 'literal',
									value: 'E',
								},
							},
							right: {
								type: 'gt',
								left: {
									type: 'property',
									name: 'firstName',
								},
								right: {
									type: 'literal',
									value: 'X',
								},
							},
						},
						right: {
							type: 'gt',
							left: {
								type: 'property',
								name: 'dob',
							},
							right: {
								type: 'literal',
								value: '1970-01-01',
							},
						},
					},
				});
			});
			it('should filter by not (firstName less than "E" or firstName greater than "X") and dob greater than "1970-01-01"', () => {
				expect(parse(`$filter=not (firstName lt 'E' or firstName gt 'X') and dob gt '1970-01-01'`)).toEqual({
					$filter: {
						type: 'and',
						left: {
							type: 'not',
							value: {
								type: 'or',
								left: {
									type: 'lt',
									left: {
										type: 'property',
										name: 'firstName',
									},
									right: {
										type: 'literal',
										value: 'E',
									},
								},
								right: {
									type: 'gt',
									left: {
										type: 'property',
										name: 'firstName',
									},
									right: {
										type: 'literal',
										value: 'X',
									},
								},
							},
						},
						right: {
							type: 'gt',
							left: {
								type: 'property',
								name: 'dob',
							},
							right: {
								type: 'literal',
								value: '1970-01-01',
							},
						},
					},
				});
			});
		});
	});

	describe('$select', () => {
		it('should select lastname', () => {
			expect(parse(`$select=lastname`)).toEqual({
				$select: ['lastname'],
			});
		});
	});

	describe('$skip', () => {
		it('should return an invalid $skip error', () => {
			const error = 'invalid $skip parameter';
			expect(parse(`$skip=`)).toEqual({ error });
			expect(parse(`$skip=foo`)).toEqual({ error });
			expect(parse(`$skip=-10`)).toEqual({ error });
		});
		it('should indicate to $skip the specified number of items', () => {
			expect(parse(`$skip=0`)).toEqual({ $skip: 0 });
			expect(parse(`$skip=5`)).toEqual({ $skip: 5 });
			expect(parse(`$skip=1024`)).toEqual({ $skip: 1024 });
		});
	});

	describe('$top', () => {
		it('should return an invalid $top error', () => {
			const error = 'invalid $top parameter';
			expect(parse(`$top=`)).toEqual({ error });
			expect(parse(`$top=foo`)).toEqual({ error });
			expect(parse(`$top=-10`)).toEqual({ error });
		});
		it('should indicate to set $top to the specified number of items', () => {
			expect(parse(`$top=0`)).toEqual({ $top: 0 });
			expect(parse(`$top=5`)).toEqual({ $top: 5 });
			expect(parse(`$top=1024`)).toEqual({ $top: 1024 });
		});
	});

	describe('$count', () => {
		it('should return an invalid $count error', () => {
			const error = 'invalid $count parameter';
			expect(parse(`$count=`)).toEqual({ error });
			expect(parse(`$count=foo`)).toEqual({ error });
			expect(parse(`$count=TRUE`)).toEqual({ error });
			expect(parse(`$count=FALSE`)).toEqual({ error });
			expect(parse(`$count=y`)).toEqual({ error });
			expect(parse(`$count=n`)).toEqual({ error });
			expect(parse(`$count=77`)).toEqual({ error });
		});
		it('should indicate whether a $count was requested', () => {
			expect(parse(`$count=true`)).toEqual({ $count: true });
			expect(parse(`$count=false`)).toEqual({ $count: false });
			expect(parse(`$count=1`)).toEqual({ $count: true });
			expect(parse(`$count=0`)).toEqual({ $count: false });
		});
	});

	describe('$maxpagesize', () => {
		it('should return an invalid $maxpagesize error', () => {
			const error = 'invalid $maxpagesize parameter';
			expect(parse(`$maxpagesize=`)).toEqual({ error });
			expect(parse(`$maxpagesize=foo`)).toEqual({ error });
			expect(parse(`$maxpagesize=-10`)).toEqual({ error });
		});
		it('should indicate to set $maxpagesize to the specified number of items', () => {
			expect(parse(`$maxpagesize=0`)).toEqual({ $maxpagesize: 0 });
			expect(parse(`$maxpagesize=5`)).toEqual({ $maxpagesize: 5 });
			expect(parse(`$maxpagesize=1024`)).toEqual({ $maxpagesize: 1024 });
		});
	});

	describe('$format', () => {
		it('should return an invalid $format error', () => {
			const error = 'invalid $format parameter';
			expect(parse(`$format=`)).toEqual({ error });
			expect(parse(`$format=foo`)).toEqual({ error });
		});
		it('should indicate the $format requested', () => {
			expect(parse(`$format=json`)).toEqual({ $format: 'json' });
			expect(parse(`$format=xml`)).toEqual({ $format: 'xml' });
		});
	});
});

/**
 * Filters an array of records based on a search dictionary, and returns only the records which
 * are constrained by the search dictionary, sorted in order of specificity.
 * @param records 
 * @param search 
 * @returns 
 */
export const filterRecords = <T extends Record<string, any>>(records: T[], search: Partial<T>): T[] => {
	const constrain = (rs: T[], fields: string[]): T[] => {
		if (fields.length === 0) {
				return rs
		}
		const acc: T[][] = []
		for (let i = 0; i < fields.length; i ++) {
				const fs = fields.filter((_f, index) => index !== i)
				const f = fields[i]
				acc.push(constrain(rs.filter((r: T) => r[f] === search[f]), fs))
				if (search[f]) {
					// if searched field is not undefined, search again with relaxed constraint
					acc.push(constrain(rs, fs))
				}
		}

		return acc.sort((a, b) => b.length - a.length)[0]
	}

	return constrain(records, Object.keys(search))
		.sort((a, b) => Object.values(b).filter(Boolean).length - Object.values(a).filter(Boolean).length)
}

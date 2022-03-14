import * as mongoose from 'mongoose';

export const processSearchAndFilter = (
    filter: { [key: string]: string },
    searchFields: string[],
    hasID?: boolean,
) => {
    let { q, ...otherFilter } = filter;
    if (!!q) {
        if (hasID && mongoose.isValidObjectId(q)) {
            return { _id: q, ...otherFilter };
        }
        // the string might contains regex special characters, therefore need to escape those characters
        const re = new RegExp(`.*${escapeRegex(q)}.*`, 'i');
        const searchFilter = searchFields.map((field) => ({
            [field]: { $regex: re },
        }));
        return { $or: searchFilter, ...otherFilter };
    }

    return otherFilter;
};

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

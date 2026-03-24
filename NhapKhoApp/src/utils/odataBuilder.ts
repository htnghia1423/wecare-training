/**
 * OData Query Builder - Build OData query strings for Dataverse
 */

export interface ODataOptions {
    filter?: string;
    orderBy?: string[];
    top?: number;
    skip?: number;
    skipToken?: string;
    select?: string[];
    expand?: string;
    count?: boolean;
}

export class ODataQueryBuilder {
    private options: ODataOptions = {};

    filter(filter: string): this {
        this.options.filter = filter;
        return this;
    }

    orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
        if (!this.options.orderBy) this.options.orderBy = [];
        this.options.orderBy.push(`${field} ${direction}`);
        return this;
    }

    top(count: number): this {
        this.options.top = count;
        return this;
    }

    skip(count: number): this {
        this.options.skip = count;
        return this;
    }

    skipToken(token: string): this {
        this.options.skipToken = token;
        return this;
    }

    select(...fields: string[]): this {
        this.options.select = fields;
        return this;
    }

    expand(expandQuery: string): this {
        this.options.expand = expandQuery;
        return this;
    }

    count(include: boolean = true): this {
        this.options.count = include;
        return this;
    }

    build(): ODataOptions {
        return { ...this.options };
    }
}

/**
 * Build filter string for contains (case-insensitive search)
 */
export function buildContainsFilter(field: string, value: string): string {
    // Dataverse typically performs case-insensitive search by default, and tolower() can cause 400 Bad Request
    return `contains(${field}, '${value}')`;
}

/**
 * Build filter string for multiple fields with OR
 */
export function buildOrFilter(filters: string[]): string {
    return filters.join(" or ");
}

/**
 * Build filter string for multiple conditions with AND
 */
export function buildAndFilter(filters: string[]): string {
    return filters.join(" and ");
}

/**
 * Escape single quotes in OData filter values
 */
export function escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
}

export function filterDuplicates<T>(sources: T[], comparator: (t1: T, t2: T) => boolean): T[] {
    return sources.filter((source, index, all) => all.findIndex(s => comparator(s, source)) === index);
}

export function groupBy<T, K extends keyof any>(list: T[], getKey: (item: T) => K) {
    return list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);
}
const requiredKeys = [
    "slug",
    "startDate",
    "endDate",
    "status",
    "reward",
    "name",
    "repoUrl",
    "isUnending",
    "description",
];
export const parseNuxtData = (input) => {
    const contests = [];
    for (let i = 0; i < input.length; i++) {
        let value = input[i];
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            const keyMap = value;
            if (!requiredKeys.some((key) => key in keyMap))
                continue;
            let keys = Object.keys(keyMap);
            let values = Object.values(keyMap);
            const positions = {};
            for (let j = 0; j < keys.length; j++) {
                if (requiredKeys.includes(keys[j])) {
                    positions[keys[j]] = values[j];
                }
            }
            // Create contest object using the positions to lookup values
            const contest = {
                slug: input[positions.slug],
                startDate: input[positions.startDate],
                endDate: input[positions.endDate],
                status: input[positions.status],
                reward: input[positions.reward],
                name: input[positions.name],
                repoUrl: input[positions.repoUrl],
                isUnending: input[positions.isUnending],
                description: input[positions.description],
            };
            contests.push(contest);
        }
    }
    return contests;
};
//# sourceMappingURL=parseNuxt.js.map
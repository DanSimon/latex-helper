module.exports = {
    transform: {
        "^.+\\.(t|j)sx?$": "@swc/jest",
    },
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    testEnvironment: "jsdom",
};

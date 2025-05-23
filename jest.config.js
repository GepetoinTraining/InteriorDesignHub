module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use jsdom for React components
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // For @testing-library/jest-dom
  moduleNameMapper: {
    // Handle CSS imports (if any in your components, otherwise not strictly needed for these tests)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias for absolute imports if you use them (e.g., src/...)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Ensure it uses your project's tsconfig
    }],
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "<rootDir>/src"
  ],
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!firebase/.*)", // Don't ignore firebase, it needs transpilation
  ],
  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

module.exports = {
	apps: [
		{
			name: "DraftDiff",
			script: "dist/index.js",
			env: {
				NODE_ENV: "development",
			},
			env_production: {
				NODE_ENV: "production",
			}
		}
	]
}

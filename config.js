module.exports = {
  db: {
    user: 'adminsql90',
    password: '@Dm1nsql90',
    server: 'dbaccess90.database.windows.net',
    database: 'api-database',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    }
  },
  google: {
    clientID: "736234633500-lh5pja216brgm2pvip4ckmn6n2hg7jsb.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }
};
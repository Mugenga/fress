module.exports = {
    app: {
      name: "Auto Assist",
      baseUrl: "https://fress-media.herokuapp.com",
      port: "3000",
      node_env: "production",
      saltRounds: 3,
      jwtKey: "1516239022",
      jwtKeyExpirationTime: '365d'
    },
    db: {
        url: "mongodb://127.0.0.1/provisoire"
    }
  };
  
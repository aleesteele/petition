// REDIS CLIENT
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", (err) => {
    console.log(err);
});

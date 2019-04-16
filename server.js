require('dotenv').config();
const app = require("./app/app");

const server_port = process.env.SERVER_PORT || 3000;

app.listen(server_port, () => {
    console.log(`Server listening on port ${server_port}`);
});
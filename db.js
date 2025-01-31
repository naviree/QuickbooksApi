const sql = require("mssql");

const config = {
	user: "jr",
	password: "",
	server: "localhost",
	database: "test",
	port: 1433,
};

async function connectDB() {
	try {
		await sql.connect(config);
		console.log("Connected to the database");
	} catch (err) {
		console.error("Database connection failed:", err);
	}
}
connectDB();

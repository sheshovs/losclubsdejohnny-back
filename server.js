import express from "express";
import cors from "cors";
import routes from "./src/api/routes/index.js";
import isValidUser from "./src/api/middleware/isValidUser.js"

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(isValidUser)
app.use(routes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
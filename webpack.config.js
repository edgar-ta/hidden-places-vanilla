import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: ["./frontend/sightseeing.js"],
  output: {
    path: path.resolve(__dirname, "frontend/dist"),
    filename: "main.js",
    library: "HiddenPlaces"
  },
};

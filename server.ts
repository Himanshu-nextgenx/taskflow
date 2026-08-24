import { app } from "./src/app";

const PORT = process.env.PORT ||  5000;

async function bootStrap() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootStrap();
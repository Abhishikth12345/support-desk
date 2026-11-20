
/* 

Core Concepts Explained


1. process and env

• process: A built-in global object in Node.js that represents your currently running program. It lets your code interact with the computer system, read command-line arguments, or stop the app using process.exit(1).
• env: Short for "environment," this is a property inside process (process.env) that holds environment variables. Developers store secret keys, passwords, and database links (like MONGODB_URI) in a hidden .env file so they do not get exposed in the main code.

2. Promises, async, and await

• Promises: Connecting to a database over the internet takes time. A Promise is a JavaScript object representing the eventual completion (or failure) of that slow task.
• async: Placed before a function (async () =>), this keyword tells JavaScript that the function will perform slow, asynchronous tasks and will always return a Promise.
• await: Placed inside an async function (await mongoose.connect(...)), this keyword pauses the function right at that line until the Promise finishes. Your app will not move to the console.log success message until the database is actually connected.

3. mongoose.connect()

• connect: A method provided by the Mongoose library that takes your database address (mongoUri) and opens a live connection to MongoDB. Because network connections can fail, this method returns a Promise.

4. try and catch

• try: A block of code where you place risky operations that might fail, such as connecting to a database or reading a missing variable.
• catch (error): If anything goes wrong inside the try block—or if you manually trigger an error with throw new Error(...)—JavaScript immediately jumps to the catch block. It captures the problem inside the error variable so you can log it cleanly instead of crashing unpredictably.

Step-by-Step Execution Flow

1. Function Call: Your main application calls connectDatabase().
2. Enter try Block: JavaScript begins running the code inside the try block safely.
3. Read Environment Variable: It grabs the database link from process.env.MONGODB_URI and saves it to mongoUri.
4. Validate the Link: The if (!mongoUri) check verifies that the link actually exists. If it is empty or missing, throw new Error(...) creates an error and immediately skips to Step 7.
5. Wait for Connection: JavaScript hits await mongoose.connect(mongoUri). It pauses execution here while Mongoose talks to the MongoDB server.
6. Success Path: Once MongoDB replies that the connection is open, the pause ends. It runs console.log("MongoDB connected successfully"), skips the catch block, and finishes the function.
7. Failure Path: If the link was missing in Step 4, or if MongoDB rejected the connection in Step 5, JavaScript jumps into catch (error). It prints the error details to the terminal and runs process.exit(1) to shut down the Node.js app completely.

*/


import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is missing");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDatabase;

import mongoose from 'mongoose';

// --------- Database Connection ----------

export const connectDB = async (): Promise<void> => {
    try {
        console.log('Starting Connection:');
        const conn = await mongoose.connect(process.env.MONGO_URI!, { maxPoolSize: 5});
        console.log(`MongoDB Connection Success! ${conn.connection.host}`);
        console.log(`Connected to database: ${conn.connection.name}`);

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('\nMongoDB has been disconnected from server termination.\n');
            process.exit(0);
        });
        

    } catch (error) {
        console.error(`\nCould not connect to the database: ${(error as Error).message}`);
        process.exit(1); 
    }
};
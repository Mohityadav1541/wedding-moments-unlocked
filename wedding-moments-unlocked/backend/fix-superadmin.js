import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

// Exact URI from Render environment
const MONGO_URI = "mongodb+srv://mrmohit1540_db_user:RHVlLfCZKBj2bN5y@cluster0.assxeey.mongodb.net/wedding-ai?retryWrites=true&w=majority&appName=Cluster0";

const checkAndCreate = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');
        console.log(`   Database: ${mongoose.connection.db.databaseName}`);

        // Check if superadmin exists
        const existing = await User.findOne({ email: 'mr.mohit1540@gmail.com' });

        if (existing) {
            console.log('\n✅ Superadmin already exists!');
            console.log(`   Email: ${existing.email}`);
            console.log(`   Role: ${existing.role}`);

            // Test password
            const isMatch = await bcrypt.compare('B93456a@5', existing.password);
            console.log(`   Password Match: ${isMatch ? '✅ YES' : '❌ NO'}`);

            if (!isMatch) {
                console.log('\n🔄 Password mismatch! Updating password...');
                const salt = await bcrypt.genSalt(10);
                existing.password = await bcrypt.hash('B93456a@5', salt);
                await existing.save();
                console.log('✅ Password updated!');
            }
        } else {
            console.log('\n❌ Superadmin NOT found! Creating...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('B93456a@5', salt);

            const superadmin = new User({
                name: 'Mohit Yadav',
                email: 'mr.mohit1540@gmail.com',
                password: hashedPassword,
                role: 'superadmin',
                studioName: 'Wedding Moments AI',
                photoLimit: 999999
            });

            await superadmin.save();
            console.log('✅ Superadmin created!');
        }

        console.log('\n📝 Login Credentials:');
        console.log('   Email: mr.mohit1540@gmail.com');
        console.log('   Password: B93456a@5');

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkAndCreate();
